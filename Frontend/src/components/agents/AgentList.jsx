// src/components/agents/AgentList.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AgentContext from '../../context/agent/agentContext';
import AgentCard from './AgentCard';
import Loading from '../common/Loading';

const AgentList = () => {
  const agentContext = useContext(AgentContext);
  const { agents, getAgents, loading } = agentContext;

  // State for the active filter
  const [activeFilter, setActiveFilter] = useState('all');
  // State for filtered agents based on type
  const [filteredAgents, setFilteredAgents] = useState([]);
  // State for search text
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getAgents();
    // eslint-disable-next-line
  }, []);

  // Effect to filter agents when agents array, active filter, or search text changes
  useEffect(() => {
    if (agents) {
      let filtered = [...agents];
      
      // Apply type filter
      if (activeFilter !== 'all') {
        filtered = filtered.filter(
          agent => agent.type.toLowerCase() === activeFilter.toLowerCase()
        );
      }
      
      // Apply search filter
      if (searchText) {
        const regex = new RegExp(searchText, 'gi');
        filtered = filtered.filter(
          agent => agent.name.match(regex) || agent.description.match(regex)
        );
      }
      
      setFilteredAgents(filtered);
    }
  }, [agents, activeFilter, searchText]);

  const onSearchChange = e => {
    setSearchText(e.target.value);
  };

  const handleFilterClick = filter => {
    setActiveFilter(filter.toLowerCase());
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="agent-list-container">
      <div className="agent-list-header">
        <h2>Agent Management</h2>
        <div className="agent-list-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search agents..."
              onChange={onSearchChange}
              value={searchText}
            />
            <i className="fas fa-search"></i>
          </div>
          <Link to="/agents/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add Agent
          </Link>
        </div>
      </div>

      <div className="agent-filter-bar">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'github' ? 'active' : ''}`}
          onClick={() => handleFilterClick('github')}
        >
          GitHub
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'slack' ? 'active' : ''}`}
          onClick={() => handleFilterClick('slack')}
        >
          Slack
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'jira' ? 'active' : ''}`}
          onClick={() => handleFilterClick('jira')}
        >
          Jira
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'shopify' ? 'active' : ''}`}
          onClick={() => handleFilterClick('shopify')}
        >
          Shopify
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'custom' ? 'active' : ''}`}
          onClick={() => handleFilterClick('custom')}
        >
          Custom
        </button>
      </div>

      {(!agents || agents.length === 0) ? (
        <div className="empty-state">
          <i className="fas fa-robot fa-4x"></i>
          <h3>No agents found</h3>
          <p>Create your first agent to get started</p>
          <Link to="/agents/new" className="btn btn-primary">
            Create Agent
          </Link>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-search fa-4x"></i>
          <h3>No matching agents</h3>
          <p>No agents match your current filter criteria</p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setActiveFilter('all');
              setSearchText('');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="agent-grid">
          {filteredAgents.map(agent => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentList;