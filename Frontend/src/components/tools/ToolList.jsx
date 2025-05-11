// src/components/tools/ToolList.jsx
import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ToolContext from '../../context/tool/toolContext';
import ToolCard from './ToolCard';
import Loading from '../common/Loading';

const ToolList = () => {
  const toolContext = useContext(ToolContext);
  const { tools, getTools, loading, filtered, filterTools } = toolContext;

  useEffect(() => {
    getTools();
    // eslint-disable-next-line
  }, []);

  const onChange = e => {
    filterTools(e.target.value);
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
              onChange={onChange}
            />
            <i className="fas fa-search"></i>
          </div>
          <Link to="/tools/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add Tool
          </Link>
        </div>
      </div>

      <div className="tool-filter-bar">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">GitHub</button>
        <button className="filter-btn">Slack</button>
        <button className="filter-btn">Jira</button>
        <button className="filter-btn">Shopify</button>
        <button className="filter-btn">Custom</button>
      </div>

      {tools && tools.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-tools fa-4x"></i>
          <h3>No tools found</h3>
          <p>Register your first tool to get started</p>
          <Link to="/tools/new" className="btn btn-primary">
            Register Tool
          </Link>
        </div>
      ) : (
        <div className="tool-grid">
          {(filtered || tools).map(tool => (
            <ToolCard key={tool._id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolList;

