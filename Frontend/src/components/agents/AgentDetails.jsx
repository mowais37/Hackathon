// components/agents/AgentDetails.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AgentContext from '../../context/agent/agentContext';
import LogContext from '../../context/log/logContext';
import ToolContext from '../../context/tool/toolContext';
import { formatDate } from '../../utils/formatDate';
import Loading from '../common/Loading';

const AgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const agentContext = useContext(AgentContext);
  const { getAgentById, current, loading, error, deleteAgent, clearCurrent } = agentContext;
  
  const logContext = useContext(LogContext);
  const { getAgentLogs, logs, loading: logsLoading } = logContext;
  
  const toolContext = useContext(ToolContext);
  const { tools, getTools } = toolContext;
  
  const [toolsDetails, setToolsDetails] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [loadTimeout, setLoadTimeout] = useState(false);
  
  useEffect(() => {
    // Set a timeout to detect if loading takes too long
    const timer = setTimeout(() => {
      if (loading) {
        setLoadTimeout(true);
      }
    }, 5000);

    // Load the agent data
    const loadData = async () => {
      try {
        await getAgentById(id);
        
        // Load recent logs for this agent
        getAgentLogs(id, 1, 5);
        
        // Load tools for reference
        getTools();
      } catch (err) {
        setLoadingError(err.message || 'Failed to load agent data');
      }
    };
    
    loadData();
    
    // Cleanup on unmount
    return () => {
      clearCurrent();
      clearTimeout(timer);
    };
    // eslint-disable-next-line
  }, [id]);
  
  // Match tool IDs to actual tool objects
  useEffect(() => {
    if (current?.tools && tools?.length > 0) {
      const toolObjects = current.tools.map(toolId => {
        return tools.find(tool => tool._id === toolId) || { _id: toolId, name: 'Unknown Tool', type: 'unknown' };
      });
      setToolsDetails(toolObjects);
    }
  }, [current, tools]);
  
  const handleDelete = async () => {
    if (confirmDelete) {
      setIsDeleting(true);
      try {
        await deleteAgent(id);
        navigate('/agents');
      } catch (error) {
        console.error('Error deleting agent:', error);
        setIsDeleting(false);
        setConfirmDelete(false);
      }
    } else {
      setConfirmDelete(true);
    }
  };
  
  // Function to get status class for styling
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'error':
        return 'status-error';
      default:
        return '';
    }
  };
  
  // Function to get type icon
  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'github':
        return 'fab fa-github';
      case 'slack':
        return 'fab fa-slack';
      case 'jira':
        return 'fas fa-tasks';
      case 'shopify':
        return 'fas fa-shopping-cart';
      default:
        return 'fas fa-robot';
    }
  };
  
  // If still loading after 5 seconds, show retry button
  if (loadTimeout && loading) {
    return (
      <div className="loading-error-container">
        <h2>Taking longer than expected...</h2>
        <p>The agent data is taking a long time to load. This might be due to network issues or the backend might not be running.</p>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setLoadTimeout(false);
            getAgentById(id);
          }}
        >
          Retry
        </button>
        <Link to="/agents" className="btn btn-secondary ml-2">
          Back to Agents
        </Link>
      </div>
    );
  }
  
  // Handle loading state
  // if (loading && !loadTimeout) {
  //   return (
  //     <div className="loading-container">
  //       <div className="loader"></div>
  //       <p>Loading agent data...</p>
  //     </div>
  //   );
  // }
  
  // Handle error state
  if (error || loadingError) {
    return (
      <div className="error-container">
        <h2>Error Loading Agent</h2>
        <p>{error || loadingError}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setLoadingError(null);
            getAgentById(id);
          }}
        >
          Retry
        </button>
        <Link to="/agents" className="btn btn-secondary ml-2">
          Back to Agents
        </Link>
      </div>
    );
  }
  
  // Handle not found state
  if (!current) {
    return (
      <div className="not-found-container">
        <div className="not-found-content">
          <h2>Agent Not Found</h2>
          <p>The agent you're looking for doesn't exist or has been removed.</p>
          <Link to="/agents" className="btn btn-primary">
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }
  
  const { name, description, type, status, code, config, createdAt, updatedAt } = current;
  
  return (
    <div className="agent-details-container">
      <div className="agent-details-header">
        <div className="back-link">
          <Link to="/agents">
            <i className="fas fa-arrow-left"></i> Back to Agents
          </Link>
        </div>
        
        <div className="agent-title">
          <h2>
            <i className={getTypeIcon(type)}></i> {name}
          </h2>
          <div className={`agent-status ${getStatusClass(status)}`}>
            {status || 'Inactive'}
          </div>
        </div>
        
        <div className="agent-actions">
          <Link to={`/agents/edit/${id}`} className="btn btn-primary">
            <i className="fas fa-edit"></i> Edit
          </Link>
          <Link to={`/chat?agent=${id}`} className="btn btn-success">
            <i className="fas fa-comments"></i> Chat
          </Link>
          <button 
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Deleting...
              </>
            ) : confirmDelete ? (
              <>
                <i className="fas fa-exclamation-triangle"></i> Confirm Delete
              </>
            ) : (
              <>
                <i className="fas fa-trash"></i> Delete
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="agent-details-grid">
        <div className="agent-overview card">
          <div className="card-header">
            <h3>Overview</h3>
          </div>
          <div className="card-body">
            <p className="agent-description">{description || 'No description provided'}</p>
            <div className="meta-info">
              <div className="meta-item">
                <strong>Type:</strong> {type || 'Custom'}
              </div>
              <div className="meta-item">
                <strong>Created:</strong> {formatDate(createdAt, true) || 'Unknown'}
              </div>
              <div className="meta-item">
                <strong>Last Updated:</strong> {formatDate(updatedAt, true) || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="agent-configuration card">
          <div className="card-header">
            <h3>Configuration</h3>
          </div>
          <div className="card-body">
            {/* GitHub configuration */}
            {type === 'github' && (
              <div className="config-section">
                <h4>GitHub Settings</h4>
                <div className="config-item">
                  <strong>Repository:</strong> {config?.repo || 'Not set'}
                </div>
                <div className="config-item">
                  <strong>API Token:</strong> {config?.token ? '••••••••••••••••' : 'Not set'}
                </div>
              </div>
            )}
            
            {/* Slack configuration */}
            {type === 'slack' && (
              <div className="config-section">
                <h4>Slack Settings</h4>
                <div className="config-item">
                  <strong>Bot Token:</strong> {config?.botToken ? '••••••••••••••••' : 'Not set'}
                </div>
                <div className="config-item">
                  <strong>Default Channel:</strong> {config?.channel || 'Not set'}
                </div>
              </div>
            )}
            
            {/* Jira configuration */}
            {type === 'jira' && (
              <div className="config-section">
                <h4>Jira Settings</h4>
                <div className="config-item">
                  <strong>Domain:</strong> {config?.domain || 'Not set'}
                </div>
                <div className="config-item">
                  <strong>Username:</strong> {config?.username || 'Not set'}
                </div>
                <div className="config-item">
                  <strong>API Token:</strong> {config?.apiToken ? '••••••••••••••••' : 'Not set'}
                </div>
              </div>
            )}
            
            {/* Shopify configuration */}
            {type === 'shopify' && (
              <div className="config-section">
                <h4>Shopify Settings</h4>
                <div className="config-item">
                  <strong>Shop Domain:</strong> {config?.shopDomain || 'Not set'}
                </div>
                <div className="config-item">
                  <strong>API Key:</strong> {config?.apiKey ? '••••••••••••••••' : 'Not set'}
                </div>
                <div className="config-item">
                  <strong>API Secret:</strong> {config?.apiSecret ? '••••••••••••••••' : 'Not set'}
                </div>
              </div>
            )}
            
            {/* Tools section */}
            <div className="config-section">
              <h4>Available Tools</h4>
              {toolsDetails && toolsDetails.length > 0 ? (
                <ul className="tools-list">
                  {toolsDetails.map((tool, index) => (
                    <li key={tool._id || index} className="tool-item">
                      <Link to={`/tools/${tool._id}`}>
                        <i className={getTypeIcon(tool.type)}></i> {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">No tools configured for this agent</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="agent-logs card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link to={`/logs?agent=${id}`}>View All</Link>
          </div>
          <div className="card-body">
            {logsLoading ? (
              <div className="loading-container">
                <div className="loader"></div>
              </div>
            ) : logs && logs.length > 0 ? (
              <ul className="logs-list">
                {logs.map((log, index) => (
                  <li key={log._id || index} className="log-item">
                    <div className={`log-type type-${(log.type || 'info').toLowerCase()}`}>
                      {log.type || 'Info'}
                    </div>
                    <div className="log-content">
                      <div className="log-message">{log.message || 'No message'}</div>
                      <div className="log-time">{formatDate(log.timestamp, true) || 'Unknown'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-text">No recent activity for this agent</p>
            )}
          </div>
        </div>
        
        <div className="agent-code card">
          <div className="card-header">
            <h3>Agent Code</h3>
          </div>
          <div className="card-body">
            <pre className="code-preview">{code || '// No code defined'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetails;