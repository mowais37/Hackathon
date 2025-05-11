// src/components/agents/AgentCard.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import AgentContext from '../../context/agent/agentContext';
import { formatDate } from '../../utils/formatDate';

const AgentCard = ({ agent }) => {
  const agentContext = useContext(AgentContext);
  const { deleteAgent, setCurrent, clearCurrent } = agentContext;

  // Make sure agent is defined and has necessary properties
  if (!agent) {
    return (
      <div className="agent-card error-card">
        <div className="card-error-message">
          Invalid agent data
        </div>
      </div>
    );
  }

  const {
    _id,
    name = 'Unnamed Agent',
    description = 'No description available',
    type = 'unknown',
    status,
    createdAt
  } = agent;

  const onDelete = () => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      deleteAgent(_id);
      clearCurrent();
    }
  };

  const onEdit = () => {
    setCurrent(agent);
  };

  // Function to get status class
  const getStatusClass = status => {
    // Check if status is defined before calling toLowerCase()
    if (!status) return 'status-unknown';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'error':
        return 'status-error';
      default:
        return 'status-unknown';
    }
  };

  // Function to get type icon
  const getTypeIcon = type => {
    // Check if type is defined before calling toLowerCase()
    if (!type) return 'fas fa-cogs';
    
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

  return (
    <div className="agent-card">
      <div className="agent-card-header">
        <div className="agent-type">
          <i className={getTypeIcon(type)}></i>
          <span>{type}</span>
        </div>
        <div className={`agent-status ${getStatusClass(status)}`}>
          <span>{status || 'Unknown'}</span>
        </div>
      </div>
      <div className="agent-card-body">
        <h3>{name}</h3>
        <p className="agent-description">
          {description ? 
            (description.length > 100 ? description.substring(0, 100) + '...' : description) 
            : 'No description available'}
        </p>
        <div className="agent-meta">
          <span>Created: {createdAt ? formatDate(createdAt) : 'Unknown'}</span>
        </div>
      </div>
      <div className="agent-card-footer">
        <Link to={`/agents/${_id}`} className="btn btn-sm btn-secondary">
          Details
        </Link>
        <Link to={`/agents/edit/${_id}`} className="btn btn-sm btn-primary" onClick={onEdit}>
          Edit
        </Link>
        <Link to={`/chat?agent=${_id}`} className="btn btn-sm btn-success">
          Chat
        </Link>
        <button className="btn btn-sm btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

AgentCard.propTypes = {
  agent: PropTypes.object.isRequired
};

export default AgentCard;