// src/mcp/tools/jiraTool.js
const JiraClient = require('jira-client');
const BaseTool = require('./baseTool');
const { createLogger } = require('../../utils/logger');

class JiraTool extends BaseTool {
  constructor(name, config) {
    super(name, config);
    
    this.logger = createLogger(`Tool:${name}`);
    
    // Initialize Jira client
    this.jiraConfig = {
      protocol: 'https',
      host: config.authConfig?.host || process.env.JIRA_HOST,
      username: config.authConfig?.username || process.env.JIRA_USERNAME,
      password: config.authConfig?.apiToken || process.env.JIRA_API_TOKEN,
      apiVersion: '3',
      strictSSL: true
    };
    
    this.client = new JiraClient(this.jiraConfig);
    
    // Default project key
    this.defaultProject = config.defaultProject;
    
    this.logger.info(`Jira tool initialized for host: ${this.jiraConfig.host}`);
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
        name: 'getProjects',
        description: 'Get a list of accessible projects',
        parameters: {
          maxResults: {
            type: 'number',
            description: 'Maximum number of projects to return',
            required: false
          }
        }
      },
      {
        name: 'getIssues',
        description: 'Search for issues with JQL',
        parameters: {
          jql: {
            type: 'string',
            description: 'JQL query string',
            required: true
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of issues to return',
            required: false
          },
          fields: {
            type: 'array',
            description: 'Fields to include in the result',
            required: false
          }
        }
      },
      {
        name: 'getIssue',
        description: 'Get details of a specific issue',
        parameters: {
          issueKey: {
            type: 'string',
            description: 'Issue key (e.g., PROJECT-123)',
            required: true
          },
          fields: {
            type: 'array',
            description: 'Fields to include in the result',
            required: false
          }
        }
      },
      {
        name: 'createIssue',
        description: 'Create a new issue',
        parameters: {
          projectKey: {
            type: 'string',
            description: 'Project key',
            required: false
          },
          summary: {
            type: 'string',
            description: 'Issue summary',
            required: true
          },
          description: {
            type: 'string',
            description: 'Issue description',
            required: true
          },
          issueType: {
            type: 'string',
            description: 'Issue type name (e.g., Bug, Task)',
            required: true
          },
          priority: {
            type: 'string',
            description: 'Priority name (e.g., High, Medium)',
            required: false
          },
          assignee: {
            type: 'string',
            description: 'Username of assignee',
            required: false
          },
          labels: {
            type: 'array',
            description: 'Array of label strings',
            required: false
          },
          customFields: {
            type: 'object',
            description: 'Custom fields as key-value pairs',
            required: false
          }
        }
      },
      {
        name: 'updateIssue',
        description: 'Update an existing issue',
        parameters: {
          issueKey: {
            type: 'string',
            description: 'Issue key (e.g., PROJECT-123)',
            required: true
          },
          summary: {
            type: 'string',
            description: 'Updated summary',
            required: false
          },
          description: {
            type: 'string',
            description: 'Updated description',
            required: false
          },
          assignee: {
            type: 'string',
            description: 'Username of assignee',
            required: false
          },
          status: {
            type: 'string',
            description: 'New status name',
            required: false
          },
          priority: {
            type: 'string',
            description: 'New priority name',
            required: false
          },
          fields: {
            type: 'object',
            description: 'Fields to update as key-value pairs',
            required: false
          }
        }
      },
      {
        name: 'addComment',
        description: 'Add a comment to an issue',
        parameters: {
          issueKey: {
            type: 'string',
            description: 'Issue key (e.g., PROJECT-123)',
            required: true
          },
          body: {
            type: 'string',
            description: 'Comment text',
            required: true
          }
        }
      },
      {
        name: 'getTransitions',
        description: 'Get available transitions for an issue',
        parameters: {
          issueKey: {
            type: 'string',
            description: 'Issue key (e.g., PROJECT-123)',
            required: true
          }
        }
      },
      {
        name: 'transitionIssue',
        description: 'Transition an issue to a new status',
        parameters: {
          issueKey: {
            type: 'string',
            description: 'Issue key (e.g., PROJECT-123)',
            required: true
          },
          transitionId: {
            type: 'string',
            description: 'Transition ID',
            required: true
          },
          comment: {
            type: 'string',
            description: 'Comment for the transition',
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
      throw new Error(`Action '${action}' not found for Jira tool`);
    }
    
    // Validate parameters
    this.validateParams(action, params, actionObj.parameters);
    
    // Execute appropriate method based on action
    switch (action) {
      case 'info':
        return this.getInfo();
      case 'getProjects':
        return this.getProjects(params);
      case 'getIssues':
        return this.getIssues(params);
      case 'getIssue':
        return this.getIssue(params);
      case 'createIssue':
        return this.createIssue(params);
      case 'updateIssue':
        return this.updateIssue(params);
      case 'addComment':
        return this.addComment(params);
      case 'getTransitions':
        return this.getTransitions(params);
      case 'transitionIssue':
        return this.transitionIssue(params);
      default:
        throw new Error(`Action '${action}' not implemented for Jira tool`);
    }
  }

  /**
   * Get a list of projects
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Projects list
   */
  async getProjects(params) {
    try {
      const { maxResults = 50 } = params;
      
      const projects = await this.client.listProjects();
      
      // Apply limit
      const limitedProjects = projects.slice(0, maxResults);
      
      return {
        success: true,
        data: limitedProjects.map(project => ({
          id: project.id,
          key: project.key,
          name: project.name,
          description: project.description,
          category: project.projectCategory ? project.projectCategory.name : null,
          lead: project.lead ? project.lead.displayName : null,
          url: project.self
        }))
      };
    } catch (error) {
      this.logger.error('Error getting Jira projects:', error);
      throw new Error(`Failed to get Jira projects: ${error.message}`);
    }
  }

  /**
   * Search for issues using JQL
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Search results
   */
  async getIssues(params) {
    try {
      const { 
        jql, 
        maxResults = 20, 
        fields = ['summary', 'status', 'assignee', 'priority', 'created', 'updated'] 
      } = params;
      
      const result = await this.client.searchJira(jql, {
        maxResults,
        fields
      });
      
      return {
        success: true,
        data: {
          total: result.total,
          issues: result.issues.map(issue => this.formatIssue(issue))
        }
      };
    } catch (error) {
      this.logger.error('Error searching Jira issues:', error);
      throw new Error(`Failed to search Jira issues: ${error.message}`);
    }
  }

  /**
   * Get a specific issue by key
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Issue details
   */
  async getIssue(params) {
    try {
      const { 
        issueKey, 
        fields = ['summary', 'description', 'status', 'assignee', 'priority', 'created', 'updated']
      } = params;
      
      const issue = await this.client.findIssue(issueKey, {
        fields: fields.join(',')
      });
      
      return {
        success: true,
        data: this.formatIssue(issue, true)
      };
    } catch (error) {
      this.logger.error(`Error getting Jira issue ${params.issueKey}:`, error);
      throw new Error(`Failed to get Jira issue: ${error.message}`);
    }
  }

  /**
   * Create a new issue
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - New issue result
   */
  async createIssue(params) {
    try {
      const { 
        projectKey = this.defaultProject, 
        summary, 
        description, 
        issueType, 
        priority, 
        assignee, 
        labels,
        customFields = {}
      } = params;
      
      if (!projectKey) {
        throw new Error('Project key is required but not provided in params or default configuration');
      }
      
      // Build issue object
      const issueData = {
        fields: {
          project: {
            key: projectKey
          },
          summary,
          description,
          issuetype: {
            name: issueType
          },
          ...customFields
        }
      };
      
      // Add optional fields if provided
      if (priority) {
        issueData.fields.priority = { name: priority };
      }
      
      if (assignee) {
        issueData.fields.assignee = { name: assignee };
      }
      
      if (labels && Array.isArray(labels)) {
        issueData.fields.labels = labels;
      }
      
      const result = await this.client.addNewIssue(issueData);
      
      return {
        success: true,
        data: {
          id: result.id,
          key: result.key,
          self: result.self
        }
      };
    } catch (error) {
      this.logger.error('Error creating Jira issue:', error);
      throw new Error(`Failed to create Jira issue: ${error.message}`);
    }
  }

  /**
   * Update an existing issue
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Update result
   */
  async updateIssue(params) {
    try {
      const { 
        issueKey, 
        summary, 
        description, 
        assignee, 
        status, 
        priority,
        fields = {} 
      } = params;
      
      // Build update object
      const updateData = {
        fields: {
          ...fields
        }
      };
      
      // Add provided fields
      if (summary) updateData.fields.summary = summary;
      if (description) updateData.fields.description = description;
      if (assignee) updateData.fields.assignee = { name: assignee };
      if (priority) updateData.fields.priority = { name: priority };
      
      // If status change is requested, first get available transitions
      if (status) {
        const transitions = await this.client.listTransitions(issueKey);
        const transition = transitions.transitions.find(t => 
          t.name.toLowerCase() === status.toLowerCase()
        );
        
        if (transition) {
          await this.client.transitionIssue(issueKey, {
            transition: {
              id: transition.id
            }
          });
        } else {
          throw new Error(`Status '${status}' is not a valid transition for issue ${issueKey}`);
        }
      }
      
      // Update the issue
      await this.client.updateIssue(issueKey, updateData);
      
      // Get updated issue
      const updatedIssue = await this.client.findIssue(issueKey);
      
      return {
        success: true,
        data: this.formatIssue(updatedIssue)
      };
    } catch (error) {
      this.logger.error(`Error updating Jira issue ${params.issueKey}:`, error);
      throw new Error(`Failed to update Jira issue: ${error.message}`);
    }
  }

  /**
   * Add a comment to an issue
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Comment result
   */
  async addComment(params) {
    try {
      const { issueKey, body } = params;
      
      const comment = await this.client.addComment(issueKey, body);
      
      return {
        success: true,
        data: {
          id: comment.id,
          author: comment.author ? comment.author.displayName : null,
          body: comment.body,
          created: comment.created,
          updated: comment.updated
        }
      };
    } catch (error) {
      this.logger.error(`Error adding comment to issue ${params.issueKey}:`, error);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  /**
   * Get available transitions for an issue
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Transitions list
   */
  async getTransitions(params) {
    try {
      const { issueKey } = params;
      
      const result = await this.client.listTransitions(issueKey);
      
      return {
        success: true,
        data: result.transitions.map(transition => ({
          id: transition.id,
          name: transition.name,
          description: transition.description,
          to: {
            id: transition.to.id,
            name: transition.to.name
          }
        }))
      };
    } catch (error) {
      this.logger.error(`Error getting transitions for issue ${params.issueKey}:`, error);
      throw new Error(`Failed to get transitions: ${error.message}`);
    }
  }

  /**
   * Transition an issue to a new status
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Transition result
   */
  async transitionIssue(params) {
    try {
      const { issueKey, transitionId, comment } = params;
      
      const transitionData = {
        transition: {
          id: transitionId
        }
      };
      
      // Add comment if provided
      if (comment) {
        transitionData.update = {
          comment: [
            {
              add: {
                body: comment
              }
            }
          ]
        };
      }
      
      await this.client.transitionIssue(issueKey, transitionData);
      
      // Get updated issue
      const updatedIssue = await this.client.findIssue(issueKey);
      
      return {
        success: true,
        data: {
          key: updatedIssue.key,
          status: updatedIssue.fields.status.name,
          comment: comment ? { added: true, body: comment } : null
        }
      };
    } catch (error) {
      this.logger.error(`Error transitioning issue ${params.issueKey}:`, error);
      throw new Error(`Failed to transition issue: ${error.message}`);
    }
  }

  /**
   * Format an issue object for consistent output
   * @param {Object} issue - Jira issue object
   * @param {boolean} detailed - Whether to include full details
   * @returns {Object} - Formatted issue object
   */
  formatIssue(issue, detailed = false) {
    const fields = issue.fields || {};
    
    const formatted = {
      id: issue.id,
      key: issue.key,
      summary: fields.summary,
      status: fields.status ? fields.status.name : null,
      priority: fields.priority ? fields.priority.name : null,
      assignee: fields.assignee ? fields.assignee.displayName : null,
      reporter: fields.reporter ? fields.reporter.displayName : null,
      created: fields.created,
      updated: fields.updated
    };
    
    // Add more details if requested
    if (detailed) {
      formatted.description = fields.description;
      formatted.issuetype = fields.issuetype ? fields.issuetype.name : null;
      formatted.labels = fields.labels || [];
      formatted.components = fields.components ? fields.components.map(c => c.name) : [];
      formatted.fixVersions = fields.fixVersions ? fields.fixVersions.map(v => v.name) : [];
      formatted.project = fields.project ? {
        id: fields.project.id,
        key: fields.project.key,
        name: fields.project.name
      } : null;
      
      // Add comments if available
      if (fields.comment && fields.comment.comments) {
        formatted.comments = fields.comment.comments.map(comment => ({
          id: comment.id,
          author: comment.author.displayName,
          body: comment.body,
          created: comment.created,
          updated: comment.updated
        }));
      }
    }
    
    return formatted;
  }
}

module.exports = JiraTool;