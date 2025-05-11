// src/mcp/agents/jiraAgent.js
const JiraClient = require('jira-client');
const BaseAgent = require('./baseAgent');

class JiraAgent extends BaseAgent {
  constructor(name, config) {
    super(name, config);
    
    // Initialize Jira client
    this.jiraConfig = {
      protocol: 'https',
      host: config.host || process.env.JIRA_HOST,
      username: config.username || process.env.JIRA_USERNAME,
      password: config.apiToken || process.env.JIRA_API_TOKEN,
      apiVersion: '3',
      strictSSL: true
    };
    
    this.client = new JiraClient(this.jiraConfig);
    
    // Default project key
    this.defaultProject = config.defaultProject;
    
    this.logger.info(`Jira agent initialized for host: ${this.jiraConfig.host}`);
  }

  /**
   * Override generate completion to add Jira-specific context
   */
  async generateCompletion(query, toolParams = {}) {
    try {
      // Get Jira context
      const jiraContext = await this.getJiraContext();
      
      // Get available tools as context
      const toolsContext = this.getToolsContext();
      
      // Construct the prompt with Jira context
      const prompt = `
      You are ${this.name}, a Jira assistant that helps users manage projects, tickets, and workflows.
      
      Jira context:
      ${jiraContext}
      
      Available tools:
      ${toolsContext}
      
      User query: ${query}
      
      Instructions:
      1. Analyze the Jira-related query
      2. Use Jira information to provide a helpful response
      3. If tools are needed, include [TOOL_ACTION:tool_name:action:parameters] in your response
      4. Provide a helpful and informative response about Jira
      
      Your response:
      `;
      
      // Call Groq API with Jira-specific prompt
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-70b-8192',
        temperature: 0.3,
        max_tokens: 1024
      });
      
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Error generating Jira completion', error);
      throw new Error(`Failed to generate Jira response: ${error.message}`);
    }
  }

  /**
   * Get Jira context information
   */
  async getJiraContext() {
    try {
      let context = "Jira Information:\n";
      
      // Get projects
      try {
        const projects = await this.client.listProjects();
        
        context += `\nProjects (${projects.length}):\n`;
        projects.slice(0, 5).forEach(project => {
          context += `- ${project.key}: ${project.name}\n`;
        });
        
        if (projects.length > 5) {
          context += `- ... and ${projects.length - 5} more\n`;
        }
      } catch (error) {
        context += "\nCouldn't retrieve projects.\n";
      }
      
      // Get recent issues if default project is set
      if (this.defaultProject) {
        try {
          const issues = await this.client.searchJira(`project = ${this.defaultProject} ORDER BY created DESC`, {
            maxResults: 5
          });
          
          context += `\nRecent issues in ${this.defaultProject} (${issues.total} total):\n`;
          issues.issues.forEach(issue => {
            context += `- ${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})\n`;
          });
        } catch (error) {
          context += `\nCouldn't retrieve issues from ${this.defaultProject}.\n`;
        }
      }
      
      return context;
    } catch (error) {
      this.logger.error('Error getting Jira context', error);
      return 'Failed to get Jira context.';
    }
  }

  /**
   * Create a new Jira issue
   */
  async createIssue(projectKey, summary, description, issueType = 'Task') {
    try {
      const issueData = {
        fields: {
          project: {
            key: projectKey || this.defaultProject
          },
          summary,
          description,
          issuetype: {
            name: issueType
          }
        }
      };
      
      const result = await this.client.addNewIssue(issueData);
      
      this.logger.info(`Issue created: ${result.key}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating issue in project ${projectKey}`, error);
      throw error;
    }
  }

  /**
   * Get issues matching a JQL query
   */
  async searchIssues(jql, maxResults = 20) {
    try {
      const result = await this.client.searchJira(jql, {
        maxResults
      });
      
      this.logger.info(`Found ${result.total} issues matching JQL: ${jql}`);
      return result.issues;
    } catch (error) {
      this.logger.error(`Error searching issues with JQL: ${jql}`, error);
      throw error;
    }
  }

  /**
   * Process a query specifically for Jira operations
   */
  async processJiraQuery(query) {
    // Common Jira-related patterns
    const createIssuePattern = /create (?:a )?(?:new )?(?:issue|ticket|task) (?:in|for) (?:project )?([A-Z0-9]+) (?:with )?(?:summary|title) ["']?([^"']+)["']?/i;
    const searchIssuesPattern = /(?:find|search|list|show) (?:all )?issues (?:in|for) (?:project )?([A-Z0-9]+)(?: where | with )?(.*)?/i;
    const getIssuePattern = /(?:get|show|tell me about) (?:issue|ticket) ([A-Z]+-\d+)/i;
    
    let result = null;
    
    // Check for create issue pattern
    const createIssueMatch = query.match(createIssuePattern);
    if (createIssueMatch) {
      const projectKey = createIssueMatch[1];
      const summary = createIssueMatch[2];
      const description = "Created via AgentDock Jira Agent";
      
      try {
        const issue = await this.createIssue(projectKey, summary, description);
        return `Issue ${issue.key} created successfully in project ${projectKey} with summary "${summary}".`;
      } catch (error) {
        throw new Error(`Failed to create issue: ${error.message}`);
      }
    }
    
    // Check for search issues pattern
    const searchIssuesMatch = query.match(searchIssuesPattern);
    if (searchIssuesMatch) {
      const projectKey = searchIssuesMatch[1];
      const conditions = searchIssuesMatch[2] || '';
      
      let jql = `project = ${projectKey}`;
      if (conditions) {
        // Simple conditions parsing - in real implementation this would be more sophisticated
        if (conditions.includes('open') || conditions.includes('unresolved')) {
          jql += ' AND status != Done AND status != Closed AND status != Resolved';
        }
        if (conditions.includes('my') || conditions.includes('assigned to me')) {
          jql += ' AND assignee = currentUser()';
        }
        if (conditions.includes('bug') || conditions.includes('bugs')) {
          jql += ' AND issuetype = Bug';
        }
      }
      
      jql += ' ORDER BY created DESC';
      
      try {
        const issues = await this.searchIssues(jql, 10);
        
        let response = `Found ${issues.length} issues in project ${projectKey}`;
        if (conditions) {
          response += ` matching "${conditions}"`;
        }
        response += ":\n\n";
        
        issues.forEach(issue => {
          response += `- ${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})\n`;
        });
        
        return response;
      } catch (error) {
        throw new Error(`Failed to search issues: ${error.message}`);
      }
    }
    
    // Check for get issue pattern
    const getIssueMatch = query.match(getIssuePattern);
    if (getIssueMatch) {
      const issueKey = getIssueMatch[1];
      
      try {
        const issue = await this.client.findIssue(issueKey);
        
        let response = `Issue ${issue.key}: ${issue.fields.summary}\n\n`;
        response += `Status: ${issue.fields.status.name}\n`;
        response += `Type: ${issue.fields.issuetype.name}\n`;
        response += `Assignee: ${issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned'}\n`;
        
        if (issue.fields.description) {
          response += `\nDescription:\n${issue.fields.description.substring(0, 200)}${issue.fields.description.length > 200 ? '...' : ''}\n`;
        }
        
        return response;
      } catch (error) {
        throw new Error(`Failed to get issue ${issueKey}: ${error.message}`);
      }
    }
    
    // If no pattern matches, use the LLM
    return null;
  }

  /**
   * Add a comment to a Jira issue
   */
  async addComment(issueKey, comment) {
    try {
      const result = await this.client.addComment(issueKey, comment);
      
      this.logger.info(`Comment added to issue ${issueKey}`);
      return result;
    } catch (error) {
      this.logger.error(`Error adding comment to issue ${issueKey}`, error);
      throw error;
    }
  }

  /**
   * Update an issue's status
   */
  async updateIssueStatus(issueKey, statusName) {
    try {
      // Get available transitions
      const transitions = await this.client.listTransitions(issueKey);
      
      // Find the transition that matches the desired status
      const transition = transitions.transitions.find(t => 
        t.to.name.toLowerCase() === statusName.toLowerCase()
      );
      
      if (!transition) {
        throw new Error(`Status '${statusName}' is not a valid transition for issue ${issueKey}`);
      }
      
      // Perform the transition
      await this.client.transitionIssue(issueKey, {
        transition: {
          id: transition.id
        }
      });
      
      this.logger.info(`Updated status of issue ${issueKey} to ${statusName}`);
      
      return {
        key: issueKey,
        status: statusName,
        transitionId: transition.id
      };
    } catch (error) {
      this.logger.error(`Error updating status of issue ${issueKey}`, error);
      throw error;
    }
  }

  /**
   * Override process query to handle Jira-specific logic first
   */
  async processQuery(query, toolParams = {}) {
    try {
      this.logger.info(`Processing Jira query: ${query}`);
      
      // First, try to handle common Jira patterns directly
      const directResult = await this.processJiraQuery(query);
      if (directResult) {
        return {
          response: directResult,
          toolResults: {}
        };
      }
      
      // If no direct handling, use the standard LLM approach
      return await super.processQuery(query, toolParams);
    } catch (error) {
      this.logger.error('Error processing Jira query', error);
      throw error;
    }
  }
}

module.exports = JiraAgent;