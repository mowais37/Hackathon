// components/agents/AgentForm.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AgentContext from '../../context/agent/agentContext';
import ToolContext from '../../context/tool/toolContext';
import { validateAgentForm } from '../../utils/validateForm';

const AgentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const agentContext = useContext(AgentContext);
  const { addAgent, updateAgent, current, clearCurrent, getAgentById, loading } = agentContext;
  
  const toolContext = useContext(ToolContext);
  const { tools, getTools } = toolContext;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'default',
    code: '',
    status: 'inactive',
    config: {},
    tools: []
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load tools on component mount
  useEffect(() => {
    getTools();
    
    // If editing an existing agent, fetch data if not already in state
    if (id && !current) {
      getAgentById(id);
    }
    
    // Cleanup on unmount
    return () => {
      if (!id) {
        clearCurrent();
      }
    };
    // eslint-disable-next-line
  }, []);
  
  // Populate form when current agent changes
  useEffect(() => {
    if (current) {
      setFormData({
        name: current.name || '',
        description: current.description || '',
        type: current.type || 'default',
        code: current.code || '',
        status: current.status || 'inactive',
        config: current.config || {},
        tools: current.tools || []
      });
    }
  }, [current]);
  
  const { name, description, type, code, status, config, tools: selectedTools } = formData;
  
  const onChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear form error when field is being edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const onConfigChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      config: {
        ...config,
        [name]: value
      }
    });
  };
  
  const onToolsChange = e => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      tools: options
    });
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate form
    const errors = validateAgentForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (current) {
        // Update existing agent
        await updateAgent({
          ...formData,
          _id: current._id
        });
      } else {
        // Create new agent
        await addAgent(formData);
      }
      
      // Redirect back to agents list
      navigate('/agents');
    } catch (err) {
      console.error('Error saving agent:', err);
      setFormErrors({
        submit: err.message || 'Failed to save agent. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/agents');
  };
  
  if (loading && id && !current) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading agent data...</p>
      </div>
    );
  }
  
  return (
    <div className="form-container">
      <h2>{id ? 'Edit Agent' : 'Create New Agent'}</h2>
      
      {formErrors.submit && (
        <div className="alert alert-danger">{formErrors.submit}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-column">
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Agent Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  className={formErrors.name ? 'error' : ''}
                  placeholder="Enter agent name"
                />
                {formErrors.name && <p className="error-text">{formErrors.name}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={onChange}
                  className={formErrors.description ? 'error' : ''}
                  placeholder="Describe what this agent does"
                  rows="4"
                ></textarea>
                {formErrors.description && <p className="error-text">{formErrors.description}</p>}
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Agent Type</label>
                <select
                  id="type"
                  name="type"
                  value={type}
                  onChange={onChange}
                >
                  <option value="default">Default</option>
                  <option value="github">GitHub</option>
                  <option value="slack">Slack</option>
                  <option value="jira">Jira</option>
                  <option value="shopify">Shopify</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={onChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Configuration</h3>
              
              <div className="form-group">
                <label htmlFor="tools">Available Tools</label>
                <select
                  id="tools"
                  name="tools"
                  multiple
                  className="multi-select"
                  value={selectedTools}
                  onChange={onToolsChange}
                >
                  {tools && tools.map(tool => (
                    <option key={tool._id} value={tool._id}>
                      {tool.name} ({tool.type})
                    </option>
                  ))}
                </select>
                <small className="form-text text-muted">
                  Hold Ctrl/Cmd to select multiple tools
                </small>
              </div>
              
              {/* GitHub Configuration */}
              {type === 'github' && (
                <>
                  <div className="form-group">
                    <label htmlFor="repo">GitHub Repository</label>
                    <input
                      type="text"
                      id="repo"
                      name="repo"
                      value={config.repo || ''}
                      onChange={onConfigChange}
                      placeholder="username/repository"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="token">GitHub Token</label>
                    <input
                      type="password"
                      id="token"
                      name="token"
                      value={config.token || ''}
                      onChange={onConfigChange}
                      placeholder="GitHub API token"
                    />
                    <small className="form-text text-muted">
                      Required for private repositories
                    </small>
                  </div>
                </>
              )}
              
              {/* Slack Configuration */}
              {type === 'slack' && (
                <>
                  <div className="form-group">
                    <label htmlFor="botToken">Bot Token</label>
                    <input
                      type="password"
                      id="botToken"
                      name="botToken"
                      value={config.botToken || ''}
                      onChange={onConfigChange}
                      placeholder="xoxb-..."
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="channel">Default Channel</label>
                    <input
                      type="text"
                      id="channel"
                      name="channel"
                      value={config.channel || ''}
                      onChange={onConfigChange}
                      placeholder="#general"
                    />
                  </div>
                </>
              )}
              
              {/* Jira Configuration */}
              {type === 'jira' && (
                <>
                  <div className="form-group">
                    <label htmlFor="domain">Jira Domain</label>
                    <input
                      type="text"
                      id="domain"
                      name="domain"
                      value={config.domain || ''}
                      onChange={onConfigChange}
                      placeholder="your-company.atlassian.net"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="apiToken">API Token</label>
                    <input
                      type="password"
                      id="apiToken"
                      name="apiToken"
                      value={config.apiToken || ''}
                      onChange={onConfigChange}
                      placeholder="Jira API token"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="username">Username/Email</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={config.username || ''}
                      onChange={onConfigChange}
                      placeholder="your-email@example.com"
                    />
                  </div>
                </>
              )}
              
              {/* Shopify Configuration */}
              {type === 'shopify' && (
                <>
                  <div className="form-group">
                    <label htmlFor="shopDomain">Shop Domain</label>
                    <input
                      type="text"
                      id="shopDomain"
                      name="shopDomain"
                      value={config.shopDomain || ''}
                      onChange={onConfigChange}
                      placeholder="your-store.myshopify.com"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="apiKey">API Key</label>
                    <input
                      type="password"
                      id="apiKey"
                      name="apiKey"
                      value={config.apiKey || ''}
                      onChange={onConfigChange}
                      placeholder="Shopify API key"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="apiSecret">API Secret</label>
                    <input
                      type="password"
                      id="apiSecret"
                      name="apiSecret"
                      value={config.apiSecret || ''}
                      onChange={onConfigChange}
                      placeholder="Shopify API secret"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="form-column">
            <div className="form-section">
              <h3>Agent Code</h3>
              <div className="form-group">
                <label htmlFor="code">JavaScript Code</label>
                <textarea
                  id="code"
                  name="code"
                  value={code}
                  onChange={onChange}
                  className={`code-editor ${formErrors.code ? 'error' : ''}`}
                  placeholder="// Write your agent code here
// Example:
async function handleQuery(query, tools) {
  // Process the query
  // Use available tools
  return {
    output: 'Response to the query'
  };
}"
                  rows="20"
                ></textarea>
                {formErrors.code && <p className="error-text">{formErrors.code}</p>}
                <small className="form-text text-muted">
                  Write JavaScript code for your agent's behavior
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (id ? 'Updating...' : 'Creating...') 
              : (id ? 'Update Agent' : 'Create Agent')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentForm;