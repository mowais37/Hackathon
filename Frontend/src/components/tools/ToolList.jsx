// src/components/tools/ToolList.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ToolContext from '../../context/tool/toolContext';
import ToolCard from './ToolCard';
import Loading from '../common/Loading';

const ToolList = () => {
  const toolContext = useContext(ToolContext);
  const { tools, getTools, loading, filterTools } = toolContext;

  // State for the active filter
  const [activeFilter, setActiveFilter] = useState('all');
  // State for filtered tools based on type
  const [filteredTools, setFilteredTools] = useState([]);
  // State for search text
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getTools();
    // eslint-disable-next-line
  }, []);

  // Effect to filter tools when tools array, active filter, or search text changes
  useEffect(() => {
    if (tools) {
      let filtered = [...tools];
      
      // Apply type filter
      if (activeFilter !== 'all') {
        filtered = filtered.filter(
          tool => tool.type.toLowerCase() === activeFilter.toLowerCase()
        );
      }
      
      // Apply search filter
      if (searchText) {
        const regex = new RegExp(searchText, 'gi');
        filtered = filtered.filter(
          tool => tool.name.match(regex) || tool.description.match(regex)
        );
      }
      
      setFilteredTools(filtered);
    }
  }, [tools, activeFilter, searchText]);

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
    <div className="tool-list-container">
      <div className="tool-list-header">
        <h2>Tool Management</h2>
        <div className="tool-list-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search tools..."
              onChange={onSearchChange}
              value={searchText}
            />
            <i className="fas fa-search"></i>
          </div>
          <Link to="/tools/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add Tool
          </Link>
        </div>
      </div>

      <div className="tool-filter-bar">
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

      {(!tools || tools.length === 0) ? (
        <div className="empty-state">
          <i className="fas fa-tools fa-4x"></i>
          <h3>No tools found</h3>
          <p>Register your first tool to get started</p>
          <Link to="/tools/new" className="btn btn-primary">
            Register Tool
          </Link>
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-search fa-4x"></i>
          <h3>No matching tools</h3>
          <p>No tools match your current filter criteria</p>
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
        <div className="tool-grid">
          {filteredTools.map(tool => (
            <ToolCard key={tool._id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolList;