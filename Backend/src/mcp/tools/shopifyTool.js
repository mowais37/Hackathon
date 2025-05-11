// src/mcp/tools/shopifyTool.js
const Shopify = require('shopify-api-node');
const BaseTool = require('./baseTool');
const { createLogger } = require('../../utils/logger');

class ShopifyTool extends BaseTool {
  constructor(name, config) {
    super(name, config);
    
    this.logger = createLogger(`Tool:${name}`);
    
    // Initialize Shopify client
    const shopName = config.authConfig?.shopName || process.env.SHOPIFY_SHOP_NAME;
    const apiKey = config.authConfig?.apiKey || process.env.SHOPIFY_API_KEY;
    const password = config.authConfig?.password || process.env.SHOPIFY_PASSWORD;
    
    this.shopify = new Shopify({
      shopName,
      apiKey,
      password
    });
    
    this.logger.info(`Shopify tool initialized for shop: ${shopName}`);
  }

  /**
   * Get available actions for this tool
   * @returns {Array} - Array of action objects
   */
  getAvailableActions() {
    return [
      {
        name: 'info',
        description: 'Get information about this tool',
        parameters: {}
      },
      {
        name: 'getProducts',
        description: 'Get a list of products',
        parameters: {
          limit: {
            type: 'number',
            description: 'Maximum number of products to return',
            required: false
          },
          title: {
            type: 'string',
            description: 'Filter by product title',
            required: false
          },
          vendor: {
            type: 'string',
            description: 'Filter by vendor',
            required: false
          },
          productType: {
            type: 'string',
            description: 'Filter by product type',
            required: false
          }
        }
      },
      {
        name: 'getProduct',
        description: 'Get a specific product by ID',
        parameters: {
          productId: {
            type: 'number',
            description: 'Product ID',
            required: true
          }
        }
      },
      {
        name: 'createProduct',
        description: 'Create a new product',
        parameters: {
          title: {
            type: 'string',
            description: 'Product title',
            required: true
          },
          bodyHtml: {
            type: 'string',
            description: 'Product description (HTML)',
            required: false
          },
          vendor: {
            type: 'string',
            description: 'Product vendor',
            required: false
          },
          productType: {
            type: 'string',
            description: 'Product type',
            required: false
          },
          tags: {
            type: 'string',
            description: 'Comma-separated list of tags',
            required: false
          },
          variants: {
            type: 'array',
            description: 'Product variants',
            required: false
          },
          images: {
            type: 'array',
            description: 'Product images',
            required: false
          }
        }
      },
      {
        name: 'updateProduct',
        description: 'Update an existing product',
        parameters: {
          productId: {
            type: 'number',
            description: 'Product ID',
            required: true
          },
          title: {
            type: 'string',
            description: 'Updated product title',
            required: false
          },
          bodyHtml: {
            type: 'string',
            description: 'Updated product description (HTML)',
            required: false
          },
          vendor: {
            type: 'string',
            description: 'Updated product vendor',
            required: false
          },
          productType: {
            type: 'string',
            description: 'Updated product type',
            required: false
          },
          tags: {
            type: 'string',
            description: 'Updated comma-separated list of tags',
            required: false
          }
        }
      },
      {
        name: 'updateInventory',
        description: 'Update product inventory',
        parameters: {
          inventoryItemId: {
            type: 'number',
            description: 'Inventory item ID',
            required: true
          },
          locationId: {
            type: 'number',
            description: 'Location ID',
            required: true
          },
          quantity: {
            type: 'number',
            description: 'New inventory quantity',
            required: true
          }
        }
      },
      {
        name: 'getOrders',
        description: 'Get a list of orders',
        parameters: {
          limit: {
            type: 'number',
            description: 'Maximum number of orders to return',
            required: false
          },
          status: {
            type: 'string',
            description: 'Filter by order status',
            required: false
          },
          financialStatus: {
            type: 'string',
            description: 'Filter by financial status',
            required: false
          },
          fulfillmentStatus: {
            type: 'string',
            description: 'Filter by fulfillment status',
            required: false
          }
        }
      },
      {
        name: 'getOrder',
        description: 'Get a specific order by ID',
        parameters: {
          orderId: {
            type: 'number',
            description: 'Order ID',
            required: true
          }
        }
      },
      {
        name: 'createDraftOrder',
        description: 'Create a draft order',
        parameters: {
          lineItems: {
            type: 'array',
            description: 'Array of line items',
            required: true
          },
          customer: {
            type: 'object',
            description: 'Customer information',
            required: false
          },
          shippingAddress: {
            type: 'object',
            description: 'Shipping address',
            required: false
          },
          note: {
            type: 'string',
            description: 'Order note',
            required: false
          },
          tags: {
            type: 'string',
            description: 'Comma-separated list of tags',
            required: false
          }
        }
      },
      {
        name: 'fulfillOrder',
        description: 'Create a fulfillment for an order',
        parameters: {
          orderId: {
            type: 'number',
            description: 'Order ID',
            required: true
          },
          trackingNumber: {
            type: 'string',
            description: 'Tracking number',
            required: false
          },
          trackingCompany: {
            type: 'string',
            description: 'Tracking company',
            required: false
          },
          notifyCustomer: {
            type: 'boolean',
            description: 'Whether to notify the customer',
            required: false
          }
        }
      }
    ];
  }

  /**
   * Execute a tool action
   * @param {string} action - Action name
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Result of the action
   */
  async execute(action, params = {}) {
    // Find the action
    const actionObj = this.actions.find(a => a.name === action);
    if (!actionObj) {
      throw new Error(`Action '${action}' not found for Shopify tool`);
    }
    
    // Validate parameters
    this.validateParams(action, params, actionObj.parameters);
    
    // Execute appropriate method based on action
    switch (action) {
      case 'info':
        return this.getInfo();
      case 'getProducts':
        return this.getProducts(params);
      case 'getProduct':
        return this.getProduct(params);
      case 'createProduct':
        return this.createProduct(params);
      case 'updateProduct':
        return this.updateProduct(params);
      case 'updateInventory':
        return this.updateInventory(params);
      case 'getOrders':
        return this.getOrders(params);
      case 'getOrder':
        return this.getOrder(params);
      case 'createDraftOrder':
        return this.createDraftOrder(params);
      case 'fulfillOrder':
        return this.fulfillOrder(params);
      default:
        throw new Error(`Action '${action}' not implemented for Shopify tool`);
    }
  }

  /**
   * Get a list of products
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Products list
   */
  async getProducts(params) {
    try {
      const { limit = 10, title, vendor, productType } = params;
      
      const query = {
        limit
      };
      
      // Add filters if provided
      if (title) query.title = title;
      if (vendor) query.vendor = vendor;
      if (productType) query.product_type = productType;
      
      const products = await this.shopify.product.list(query);
      
      return {
        success: true,
        data: products.map(product => this.formatProduct(product))
      };
    } catch (error) {
      this.logger.error('Error getting Shopify products:', error);
      throw new Error(`Failed to get Shopify products: ${error.message}`);
    }
  }

  /**
   * Get a specific product by ID
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Product details
   */
  async getProduct(params) {
    try {
      const { productId } = params;
      
      const product = await this.shopify.product.get(productId);
      
      return {
        success: true,
        data: this.formatProduct(product, true)
      };
    } catch (error) {
      this.logger.error(`Error getting Shopify product ${params.productId}:`, error);
      throw new Error(`Failed to get Shopify product: ${error.message}`);
    }
  }

  /**
   * Create a new product
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - New product result
   */
  async createProduct(params) {
    try {
      const { 
        title, 
        bodyHtml, 
        vendor, 
        productType, 
        tags,
        variants = [],
        images = []
      } = params;
      
      const productData = {
        title,
        body_html: bodyHtml,
        vendor,
        product_type: productType,
        tags,
        variants,
        images
      };
      
      // Remove undefined values
      Object.keys(productData).forEach(key => {
        if (productData[key] === undefined) {
          delete productData[key];
        }
      });
      
      const product = await this.shopify.product.create(productData);
      
      return {
        success: true,
        data: this.formatProduct(product)
      };
    } catch (error) {
      this.logger.error('Error creating Shopify product:', error);
      throw new Error(`Failed to create Shopify product: ${error.message}`);
    }
  }

  /**
   * Update an existing product
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Updated product result
   */
  async updateProduct(params) {
    try {
      const { 
        productId, 
        title, 
        bodyHtml, 
        vendor, 
        productType, 
        tags
      } = params;
      
      const updateData = {};
      
      // Add provided fields
      if (title !== undefined) updateData.title = title;
      if (bodyHtml !== undefined) updateData.body_html = bodyHtml;
      if (vendor !== undefined) updateData.vendor = vendor;
      if (productType !== undefined) updateData.product_type = productType;
      if (tags !== undefined) updateData.tags = tags;
      
      const product = await this.shopify.product.update(productId, updateData);
      
      return {
        success: true,
        data: this.formatProduct(product)
      };
    } catch (error) {
      this.logger.error(`Error updating Shopify product ${params.productId}:`, error);
      throw new Error(`Failed to update Shopify product: ${error.message}`);
    }
  }

  /**
   * Update product inventory
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Inventory update result
   */
  async updateInventory(params) {
    try {
      const { inventoryItemId, locationId, quantity } = params;
      
      const inventoryData = {
        inventory_item_id: inventoryItemId,
        location_id: locationId,
        available: quantity
      };
      
      const result = await this.shopify.inventoryLevel.set(inventoryData);
      
      return {
        success: true,
        data: {
          inventoryItemId: result.inventory_item_id,
          locationId: result.location_id,
          available: result.available,
          updated: result.updated_at
        }
      };
    } catch (error) {
      this.logger.error('Error updating Shopify inventory:', error);
      throw new Error(`Failed to update Shopify inventory: ${error.message}`);
    }
  }

  /**
   * Get a list of orders
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Orders list
   */
  async getOrders(params) {
    try {
      const { 
        limit = 10, 
        status, 
        financialStatus, 
        fulfillmentStatus 
      } = params;
      
      const query = {
        limit,
        status,
        financial_status: financialStatus,
        fulfillment_status: fulfillmentStatus
      };
      
      // Remove undefined values
      Object.keys(query).forEach(key => {
        if (query[key] === undefined) {
          delete query[key];
        }
      });
      
      const orders = await this.shopify.order.list(query);
      
      return {
        success: true,
        data: orders.map(order => this.formatOrder(order))
      };
    } catch (error) {
      this.logger.error('Error getting Shopify orders:', error);
      throw new Error(`Failed to get Shopify orders: ${error.message}`);
    }
  }

  /**
   * Get a specific order by ID
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Order details
   */
  async getOrder(params) {
    try {
      const { orderId } = params;
      
      const order = await this.shopify.order.get(orderId);
      
      return {
        success: true,
        data: this.formatOrder(order, true)
      };
    } catch (error) {
      this.logger.error(`Error getting Shopify order ${params.orderId}:`, error);
      throw new Error(`Failed to get Shopify order: ${error.message}`);
    }
  }

  /**
   * Create a draft order
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - New draft order result
   */
  async createDraftOrder(params) {
    try {
      const { 
        lineItems, 
        customer, 
        shippingAddress, 
        note, 
        tags 
      } = params;
      
      const draftOrderData = {
        line_items: lineItems,
        customer,
        shipping_address: shippingAddress,
        note,
        tags
      };
      
      // Remove undefined values
      Object.keys(draftOrderData).forEach(key => {
        if (draftOrderData[key] === undefined) {
          delete draftOrderData[key];
        }
      });
      
      const draftOrder = await this.shopify.draftOrder.create(draftOrderData);
      
      return {
        success: true,
        data: {
          id: draftOrder.id,
          name: draftOrder.name,
          status: draftOrder.status,
          totalPrice: draftOrder.total_price,
          subtotalPrice: draftOrder.subtotal_price,
          createdAt: draftOrder.created_at,
          updatedAt: draftOrder.updated_at,
          lineItems: draftOrder.line_items.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            productId: item.product_id,
            variantId: item.variant_id
          }))
        }
      };
    } catch (error) {
      this.logger.error('Error creating Shopify draft order:', error);
      throw new Error(`Failed to create Shopify draft order: ${error.message}`);
    }
  }

  /**
   * Create a fulfillment for an order
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Fulfillment result
   */
  async fulfillOrder(params) {
    try {
      const { 
        orderId, 
        trackingNumber, 
        trackingCompany, 
        notifyCustomer = true 
      } = params;
      
      // Get order to get line items
      const order = await this.shopify.order.get(orderId);
      
      // Prepare line items
      const lineItems = order.line_items.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
      
      const fulfillmentData = {
        line_items: lineItems,
        notify_customer: notifyCustomer
      };
      
      // Add tracking info if provided
      if (trackingNumber || trackingCompany) {
        fulfillmentData.tracking_info = {};
        
        if (trackingNumber) {
          fulfillmentData.tracking_info.number = trackingNumber;
        }
        
        if (trackingCompany) {
          fulfillmentData.tracking_info.company = trackingCompany;
        }
      }
      
      const fulfillment = await this.shopify.fulfillment.create(orderId, fulfillmentData);
      
      return {
        success: true,
        data: {
          id: fulfillment.id,
          orderId: fulfillment.order_id,
          status: fulfillment.status,
          trackingCompany: fulfillment.tracking_company,
          trackingNumber: fulfillment.tracking_number,
          createdAt: fulfillment.created_at,
          updatedAt: fulfillment.updated_at
        }
      };
    } catch (error) {
      this.logger.error(`Error fulfilling Shopify order ${params.orderId}:`, error);
      throw new Error(`Failed to fulfill Shopify order: ${error.message}`);
    }
  }

  /**
   * Format a product object for consistent output
   * @param {Object} product - Shopify product object
   * @param {boolean} detailed - Whether to include full details
   * @returns {Object} - Formatted product object
   */
  formatProduct(product, detailed = false) {
    const formatted = {
      id: product.id,
      title: product.title,
      handle: product.handle,
      vendor: product.vendor,
      productType: product.product_type,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      status: product.status,
      tags: product.tags ? product.tags.split(', ') : [],
      variants: product.variants ? product.variants.length : 0,
      images: product.images ? product.images.length : 0
    };
    
    // Add more details if requested
    if (detailed) {
      formatted.description = product.body_html;
      
      // Add variants
      if (product.variants && product.variants.length > 0) {
        formatted.variantDetails = product.variants.map(variant => ({
          id: variant.id,
          title: variant.title,
          price: variant.price,
          sku: variant.sku,
          inventoryQuantity: variant.inventory_quantity,
          inventoryManagement: variant.inventory_management,
          inventoryPolicy: variant.inventory_policy,
          barcode: variant.barcode
        }));
      }
      
      // Add images
      if (product.images && product.images.length > 0) {
        formatted.imageDetails = product.images.map(image => ({
          id: image.id,
          src: image.src,
          position: image.position,
          alt: image.alt,
          width: image.width,
          height: image.height
        }));
      }
    }
    
    return formatted;
  }

  /**
   * Format an order object for consistent output
   * @param {Object} order - Shopify order object
   * @param {boolean} detailed - Whether to include full details
   * @returns {Object} - Formatted order object
   */
  formatOrder(order, detailed = false) {
    const formatted = {
      id: order.id,
      name: order.name,
      email: order.email,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      totalPrice: order.total_price,
      subtotalPrice: order.subtotal_price,
      totalTax: order.total_tax,
      currency: order.currency,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      itemCount: order.line_items ? order.line_items.length : 0
    };
    
    // Add more details if requested
    if (detailed) {
      // Add customer details
      if (order.customer) {
        formatted.customer = {
          id: order.customer.id,
          email: order.customer.email,
          firstName: order.customer.first_name,
          lastName: order.customer.last_name,
          phone: order.customer.phone
        };
      }
      
      // Add shipping address
      if (order.shipping_address) {
        formatted.shippingAddress = {
          firstName: order.shipping_address.first_name,
          lastName: order.shipping_address.last_name,
          address1: order.shipping_address.address1,
          address2: order.shipping_address.address2,
          city: order.shipping_address.city,
          province: order.shipping_address.province,
          country: order.shipping_address.country,
          zip: order.shipping_address.zip,
          phone: order.shipping_address.phone
        };
      }
      
      // Add line items
      if (order.line_items && order.line_items.length > 0) {
        formatted.lineItems = order.line_items.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          sku: item.sku,
          productId: item.product_id,
          variantId: item.variant_id,
          taxable: item.taxable,
          fulfillmentStatus: item.fulfillment_status
        }));
      }
      
      // Add fulfillments
      if (order.fulfillments && order.fulfillments.length > 0) {
        formatted.fulfillments = order.fulfillments.map(fulfillment => ({
          id: fulfillment.id,
          status: fulfillment.status,
          trackingCompany: fulfillment.tracking_company,
          trackingNumber: fulfillment.tracking_number,
          createdAt: fulfillment.created_at
        }));
      }
    }
    
    return formatted;
  }
}

module.exports = ShopifyTool;