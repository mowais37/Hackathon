// src/components/agents/AgentList.jsx
import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AgentContext from '../../context/agent/agentContext';
import AgentCard from './AgentCard';
import Loading from '../common/Loading';

const AgentList = () => {
  const agentContext = useContext(AgentContext);
  const { agents, getAgents, loading, filtered, filterAgents } = agentContext;

  useEffect(() => {
    getAgents();
    // eslint-disable-next-line
  }, []);

  const onChange = e => {
    filterAgents(e.target.value);
  };

  if (loading) {
    return <Loading />;
  }

  // Ensure agents is an array
  const agentsArray = Array.isArray(agents) ? agents : [];
  const filteredArray = Array.isArray(filtered) ? filtered : [];
  
  // Determine which array to use for rendering
  const displayAgents = filteredArray.length > 0 ? filteredArray : agentsArray;

  return (
    <div className="agent-list-container">
      <div className="agent-list-header">
        <h2>Agent Management</h2>
        <div className="agent-list-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search agents..."
              onChange={onChange}
            />
            <i className="fas fa-search"></i>
          </div>
          <Link to="/agents/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add Agent
          </Link>
        </div>
      </div>

      <div className="agent-filter-bar">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">GitHub</button>
        <button className="filter-btn">Slack</button>
        <button className="filter-btn">Jira</button>
        <button className="filter-btn">Custom</button>
      </div>

      {displayAgents.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-robot fa-4x"></i>
          <h3>No agents found</h3>
          <p>Create your first agent to get started</p>
          <Link to="/agents/new" className="btn btn-primary">
            Create Agent
          </Link>
        </div>
      ) : (
        <div className="agent-grid">
          {displayAgents.map(agent => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentList;