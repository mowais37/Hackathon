// src/components/dashboard/RecentActivity.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/formatDate';

const RecentActivity = ({ logs = [] }) => {
  // Get type icon based on log type
  const getTypeIcon = type => {
    if (!type) return 'fa-info-circle';
    
    switch (type.toLowerCase()) {
      case 'query':
        return 'fa-comment-dots';
      case 'action':
        return 'fa-bolt';
      case 'error':
        return 'fa-exclamation-triangle';
      case 'system':
        return 'fa-cog';
      default:
        return 'fa-info-circle';
    }
  };
  
  return (
    <div className="card recent-activity">
      <div className="card-header">
        <h3>Recent Activity</h3>
        <Link to="/logs">View All</Link>
      </div>
      <div className="card-body">
        {!logs || logs.length === 0 ? (
          <div className="empty-state compact">
            <p>No recent activity</p>
          </div>
        ) : (
          <ul className="activity-list">
            {logs.map((log, index) => (
              <li key={log._id || index} className="activity-item">
                <div className="activity-icon">
                  <i className={`fas ${getTypeIcon(log.type)}`}></i>
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className={`activity-type type-${(log.type || 'info').toLowerCase()}`}>
                      {log.type || 'Info'}
                    </span>
                    <span className="activity-time">
                      {formatDate(log.timestamp || new Date())}
                    </span>
                  </div>
                  <p className="activity-message">{log.message || 'No message'}</p>
                  {(log.agentName || log.toolName || log.agentId || log.toolId) && (
                    <div className="activity-source">
                      {(log.agentName || log.agentId) && (
                        <Link to={`/agents/${log.agentId}`} className="source-link">
                          <i className="fas fa-robot"></i> {log.agentName || 'Unknown Agent'}
                        </Link>
                      )}
                      {(log.toolName || log.toolId) && (
                        <Link to={`/tools/${log.toolId}`} className="source-link">
                          <i className="fas fa-tools"></i> {log.toolName || 'Unknown Tool'}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

RecentActivity.propTypes = {
  logs: PropTypes.array
};

export default RecentActivity;