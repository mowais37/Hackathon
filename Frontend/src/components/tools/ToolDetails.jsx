// src/components/tools/ToolDetails.jsx
import React, { useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ToolContext from '../../context/tool/toolContext';
import LogContext from '../../context/log/logContext';
import Loading from '../common/Loading';
import { formatDate } from '../../utils/formatDate';

const ToolDetails = () => {
  const toolContext = useContext(ToolContext);
  const { current, getTools, setCurrent } = toolContext;

  const logContext = useContext(LogContext);
  const { logs, getToolLogs, loading: logsLoading } = logContext;

  const { id } = useParams();

  useEffect(() => {
    getTools();
    
    // Find and set the current tool
    if (toolContext.tools) {
      const tool = toolContext.tools.find(t => t._id === id);
      if (tool) {
        setCurrent(tool);
      }
    }
    
    // Get logs for this tool
    getToolLogs(id);
    
    // eslint-disable-next-line
  }, [id]);

  if (!current) {
    return <Loading />;
  }

  const {
    name,
    description,
    type,
    endpoint,
    method,
    headers,
    parameters,
    auth,
    createdAt,
    updatedAt
  } = current;

  // Function to get type icon
  const getTypeIcon = type => {
    switch (type.toLowerCase()) {
      case 'github':
        return 'fab fa-github';
      case 'slack':
        return 'fab fa-slack';
      case 'jira':
        return 'fas fa-tasks';
      case 'shopify':
        return 'fas fa-shopping-cart';
      default:
        return 'fas fa-cogs';
    }
  };

  // Function to get method badge class
  const getMethodClass = method => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'method-get';
      case 'POST':
        return 'method-post';
      case 'PUT':
        return 'method-put';
      case 'DELETE':
        return 'method-delete';
      case 'PATCH':
        return 'method-patch';
      default:
        return '';
    }
  };

  return (
    <div className="tool-details-container">
      <div className="tool-details-header">
        <div className="back-button">
          <Link to="/tools">
            <i className="fas fa-arrow-left"></i> Back to Tools
          </Link>
        </div>
        <h2>
          <i className={getTypeIcon(type)}></i> {name}
        </h2>
        <div className="tool-actions">
          <Link to={`/tools/edit/${id}`} className="btn btn-primary">
            Edit
          </Link>
        </div>
      </div>

      <div className="tool-details-grid">
        <div className="tool-overview card">
          <div className="card-header">
            <h3>Overview</h3>
            <div className={`tool-method ${getMethodClass(method)}`}>
              <span>{method}</span>
            </div>
          </div>
          <div className="card-body">
            <p className="tool-description">{description}</p>
            <div className="meta-info">
              <div className="meta-item">
                <strong>Type:</strong> {type}
              </div>
              <div className="meta-item">
                <strong>Endpoint:</strong> {endpoint}
              </div>
              <div className="meta-item">
                <strong>Created:</strong> {formatDate(createdAt, true)}
              </div>
              <div className="meta-item">
                <strong>Last Updated:</strong> {formatDate(updatedAt, true)}
              </div>
            </div>
          </div>
        </div>

        <div className="tool-auth card">
          <div className="card-header">
            <h3>Authentication</h3>
          </div>
          <div className="card-body">
            <div className="auth-type">
              <strong>Type:</strong> {auth.type === 'none' ? 'None' : auth.type}
            </div>
            
            {auth.type === 'basic' && (
              <>
                <div className="auth-item">
                  <strong>Username:</strong> {auth.username}
                </div>
                <div className="auth-item">
                  <strong>Password:</strong> ••••••••••••••••
                </div>
              </>
            )}
            
            {auth.type === 'bearer' && (
              <div className="auth-item">
                <strong>Token:</strong> ••••••••••••••••
              </div>
            )}
            
            {auth.type === 'apiKey' && (
              <div className="auth-item">
                <strong>API Key:</strong> ••••••••••••••••
              </div>
            )}
          </div>
        </div>

        <div className="tool-headers card">
          <div className="card-header">
            <h3>Headers</h3>
          </div>
          <div className="card-body">
            {headers && Object.keys(headers).length > 0 ? (
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(headers).map(([key, value], index) => (
                    <tr key={index}>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No headers configured</p>
              </div>
            )}
          </div>
        </div>

        <div className="tool-parameters card">
          <div className="card-header">
            <h3>Parameters</h3>
          </div>
          <div className="card-body">
            {parameters && parameters.length > 0 ? (
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Required</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((param, index) => (
                    <tr key={index}>
                      <td>{param.name}</td>
                      <td>{param.description}</td>
                      <td>{param.type}</td>
                      <td>{param.required ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No parameters configured</p>
              </div>
            )}
          </div>
        </div>

        <div className="tool-recent-activity card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link to={`/logs?tool=${id}`}>View All</Link>
          </div>
          <div className="card-body">
            {logsLoading ? (
              <Loading />
            ) : logs && logs.length > 0 ? (
              <ul className="log-list">
                {logs.slice(0, 5).map(log => (
                  <li key={log._id} className={`log-item log-${log.level}`}>
                    <div className="log-time">{formatDate(log.timestamp, true)}</div>
                    <div className="log-message">{log.message}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolDetails;