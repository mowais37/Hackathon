// src/mcp/agents/shopifyAgent.js
const Shopify = require('shopify-api-node');
const BaseAgent = require('./baseAgent');

class ShopifyAgent extends BaseAgent {
  constructor(name, config) {
    super(name, config);
    
    // Initialize Shopify client
    const shopName = config.shopName || process.env.SHOPIFY_SHOP_NAME;
    const apiKey = config.apiKey || process.env.SHOPIFY_API_KEY;
    const password = config.password || process.env.SHOPIFY_PASSWORD;
    
    this.shopify = new Shopify({
      shopName,
      apiKey,
      password
    });
    
    this.logger.info(`Shopify agent initialized for shop: ${shopName}`);
  }

  /**
   * Override generate completion to add Shopify-specific context
   */
  async generateCompletion(query, toolParams = {}) {
    try {
      // Get Shopify context
      const shopifyContext = await this.getShopifyContext();
      
      // Get available tools as context
      const toolsContext = this.getToolsContext();
      
      // Construct the prompt with Shopify context
      const prompt = `
      You are ${this.name}, a Shopify assistant that helps users manage their online store, products, and orders.
      
      Shopify context:
      ${shopifyContext}
      
      Available tools:
      ${toolsContext}
      
      User query: ${query}
      
      Instructions:
      1. Analyze the Shopify-related query
      2. Use Shopify information to provide a helpful response
      3. If tools are needed, include [TOOL_ACTION:tool_name:action:parameters] in your response
      4. Provide a helpful and informative response about Shopify
      
      Your response:
      `;
      
      // Call Groq API with Shopify-specific prompt
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-70b-8192',
        temperature: 0.3,
        max_tokens: 1024
      });
      
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Error generating Shopify completion', error);
      throw new Error(`Failed to generate Shopify response: ${error.message}`);
    }
  }

  /**
   * Get Shopify context information
   */
  async getShopifyContext() {
    try {
      let context = "Shopify Store Information:\n";
      
      // Get shop information
      try {
        const shop = await this.shopify.shop.get();
        
        context += `\nShop: ${shop.name} (${shop.myshopify_domain})\n`;
        context += `Plan: ${shop.plan_name}\n`;
        context += `Currency: ${shop.currency}\n`;
        context += `Country: ${shop.country_name}\n`;
      } catch (error) {
        context += "\nCouldn't retrieve shop information.\n";
      }
      
      // Get product count and sample products
      try {
        const productCount = await this.shopify.product.count();
        const products = await this.shopify.product.list({ limit: 5 });
        
        context += `\nProducts (${productCount} total):\n`;
        products.forEach(product => {
          const price = product.variants[0]?.price || 'N/A';
          const inventory = product.variants[0]?.inventory_quantity || 0;
          context += `- ${product.title} ($${price}, Stock: ${inventory})\n`;
        });
        
        if (productCount > 5) {
          context += `- ... and ${productCount - 5} more\n`;
        }
      } catch (error) {
        context += "\nCouldn't retrieve products.\n";
      }
      
      // Get recent orders
      try {
        const orders = await this.shopify.order.list({
          limit: 5,
          status: 'any'
        });
        
        context += `\nRecent orders:\n`;
        orders.forEach(order => {
          context += `- ${order.name}: $${order.total_price} (${order.financial_status})\n`;
        });
      } catch (error) {
        context += "\nCouldn't retrieve orders.\n";
      }
      
      return context;
    } catch (error) {
      this.logger.error('Error getting Shopify context', error);
      return 'Failed to get Shopify context.';
    }
  }

  /**
   * Get products with optional filters
   */
  async getProducts(limit = 10, query = {}) {
    try {
      const params = {
        limit,
        ...query
      };
      
      const products = await this.shopify.product.list(params);
      
      this.logger.info(`Retrieved ${products.length} products`);
      return products;
    } catch (error) {
      this.logger.error('Error getting products', error);
      throw error;
    }
  }

  /**
   * Get a specific product by ID
   */
  async getProduct(productId) {
    try {
      const product = await this.shopify.product.get(productId);
      
      this.logger.info(`Retrieved product ${productId}`);
      return product;
    } catch (error) {
      this.logger.error(`Error getting product ${productId}`, error);
      throw error;
    }
  }

  /**
   * Update product inventory
   */
  async updateInventory(inventoryItemId, locationId, quantity) {
    try {
      const result = await this.shopify.inventoryLevel.set({
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        available: quantity
      });
      
      this.logger.info(`Updated inventory for item ${inventoryItemId} to ${quantity}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating inventory for item ${inventoryItemId}`, error);
      throw error;
    }
  }

  /**
   * Process a query specifically for Shopify operations
   */
  async processShopifyQuery(query) {
    // Common Shopify-related patterns
    const updateInventoryPattern = /update (?:the )?(?:inventory|stock) (?:for|of) (?:product )?["']?([^"']+)["']? to (\d+)/i;
    const getProductPattern = /(?:get|show|find|tell me about) (?:the )?(?:product|item) ["']?([^"']+)["']?/i;
    const lowInventoryPattern = /(?:list|show|find|what are) (?:the )?(?:products|items) (?:with )?(?:low|limited) (?:inventory|stock)/i;
    
    let result = null;
    
    // Check for update inventory pattern
    const updateInventoryMatch = query.match(updateInventoryPattern);
    if (updateInventoryMatch) {
      const productTitle = updateInventoryMatch[1];
      const newQuantity = parseInt(updateInventoryMatch[2], 10);
      
      try {
        // Find the product by title
        const products = await this.shopify.product.list({
          title: productTitle,
          limit: 1
        });
        
        if (products.length === 0) {
          return `No product found with title "${productTitle}".`;
        }
        
        const product = products[0];
        
        // Get the first variant's inventory item ID
        if (!product.variants || product.variants.length === 0) {
          return `Product "${productTitle}" has no variants to update.`;
        }
        
        const variant = product.variants[0];
        const inventoryItemId = variant.inventory_item_id;
        
        // Get locations
        const locations = await this.shopify.location.list();
        if (locations.length === 0) {
          return `No locations found to update inventory.`;
        }
        
        // Update inventory at the first location
        const locationId = locations[0].id;
        
        await this.updateInventory(inventoryItemId, locationId, newQuantity);
        
        return `Updated inventory for "${productTitle}" to ${newQuantity} units.`;
      } catch (error) {
        throw new Error(`Failed to update inventory: ${error.message}`);
      }
    }
    
    // Check for get product pattern
    const getProductMatch = query.match(getProductPattern);
    if (getProductMatch) {
      const productTitle = getProductMatch[1];
      
      try {
        // Find the product by title
        const products = await this.shopify.product.list({
          title: productTitle,
          limit: 1
        });
        
        if (products.length === 0) {
          return `No product found with title "${productTitle}".`;
        }
        
        const product = products[0];
        
        let response = `Product: ${product.title}\n\n`;
        response += `Type: ${product.product_type || 'N/A'}\n`;
        response += `Vendor: ${product.vendor || 'N/A'}\n`;
        response += `Status: ${product.status}\n`;
        
        if (product.variants && product.variants.length > 0) {
          const variant = product.variants[0];
          response += `Price: $${variant.price}\n`;
          response += `SKU: ${variant.sku || 'N/A'}\n`;
          response += `Inventory: ${variant.inventory_quantity || 0} units\n`;
        }
        
        return response;
      } catch (error) {
        throw new Error(`Failed to get product: ${error.message}`);
      }
    }
    
    // Check for low inventory pattern
    const lowInventoryMatch = query.match(lowInventoryPattern);
    if (lowInventoryMatch) {
      try {
        // Get all products
        const products = await this.shopify.product.list({ limit: 250 });
        
        // Find products with low inventory (less than 10)
        const lowInventoryProducts = products.filter(product => {
          if (!product.variants || product.variants.length === 0) {
            return false;
          }
          
          return product.variants.some(variant => {
            return variant.inventory_quantity !== null && variant.inventory_quantity < 10;
          });
        });
        
        if (lowInventoryProducts.length === 0) {
          return `No products found with low inventory (below 10 units).`;
        }
        
        let response = `Products with low inventory (below 10 units):\n\n`;
        
        lowInventoryProducts.forEach(product => {
          const lowVariants = product.variants.filter(v => v.inventory_quantity !== null && v.inventory_quantity < 10);
          
          lowVariants.forEach(variant => {
            response += `- ${product.title}${variant.title !== 'Default Title' ? ` (${variant.title})` : ''}: ${variant.inventory_quantity} units\n`;
          });
        });
        
        return response;
      } catch (error) {
        throw new Error(`Failed to find low inventory products: ${error.message}`);
      }
    }
    
    // If no pattern matches, use the LLM
    return null;
  }

  /**
   * Override process query to handle Shopify-specific logic first
   */
  async processQuery(query, toolParams = {}) {
    try {
      this.logger.info(`Processing Shopify query: ${query}`);
      
      // First, try to handle common Shopify patterns directly
      const directResult = await this.processShopifyQuery(query);
      if (directResult) {
        return {
          response: directResult,
          toolResults: {}
        };
      }
      
      // If no direct handling, use the standard LLM approach
      return await super.processQuery(query, toolParams);
    } catch (error) {
      this.logger.error('Error processing Shopify query', error);
      throw error;
    }
  }
}

module.exports = ShopifyAgent;