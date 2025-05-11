// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AgentContext from '../../context/agent/agentContext';
import ToolContext from '../../context/tool/toolContext';
import LogContext from '../../context/log/logContext';
import Stats from './Stats';
import RecentActivity from './RecentActivity';
import Loading from '../common/Loading';

const Dashboard = () => {
  const agentContext = useContext(AgentContext);
  const { agents, getAgents, loading: agentsLoading } = agentContext;
  
  const toolContext = useContext(ToolContext);
  const { tools, getTools, loading: toolsLoading } = toolContext;
  
  const logContext = useContext(LogContext);
  const { logs, getLogs, loading: logsLoading } = logContext;
  
  useEffect(() => {
    getAgents();
    getTools();
    getLogs(1, 5); // Get first page with 5 logs
    // eslint-disable-next-line
  }, []);
  
  // Ensure agents, tools, and logs are arrays before calculating stats
  const agentsArray = Array.isArray(agents) ? agents : [];
  const toolsArray = Array.isArray(tools) ? tools : [];
  const logsArray = Array.isArray(logs) ? logs : [];
  
  // Calculate stats
  const stats = {
    totalAgents: agentsArray.length,
    activeAgents: agentsArray.filter(agent => agent.status === 'active').length,
    totalTools: toolsArray.length,
    totalLogs: logsArray.length,
    querySuccess: logsArray
      .filter(log => log.type === 'query' && log.status === 'success').length,
    queryTotal: logsArray
      .filter(log => log.type === 'query').length
  };
  
  // Calculate success rate
  stats.successRate = stats.queryTotal > 0 
    ? Math.round((stats.querySuccess / stats.queryTotal) * 100) 
    : 0;
  
  if (agentsLoading && toolsLoading && logsLoading) {
    return <Loading />;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
      </div>
      
      <div className="welcome-card">
        <div className="welcome-content">
          <h3>Welcome to AgentDock</h3>
          <p>
            Manage your intelligent agents and tools with a simple interface. 
            Use natural language to interact with your agents and integrate with external services.
          </p>
        </div>
        <div className="welcome-actions">
          <Link to="/agents/new" className="btn btn-primary">
            Create Agent
          </Link>
          <Link to="/tools/new" className="btn btn-secondary">
            Register Tool
          </Link>
        </div>
      </div>
      
      <Stats stats={stats} />
      
      <div className="dashboard-grid">
        <div className="grid-column">
          <div className="card">
            <div className="card-header">
              <h3>Recent Agents</h3>
              <Link to="/agents">View All</Link>
            </div>
            <div className="card-body">
              {!agentsArray.length ? (
                <div className="empty-state compact">
                  <p>No agents created yet</p>
                  <Link to="/agents/new" className="btn btn-sm btn-primary">
                    Create Agent
                  </Link>
                </div>
              ) : (
                <ul className="entity-list">
                  {agentsArray.slice(0, 3).map(agent => (
                    <li key={agent._id} className="entity-item">
                      <Link to={`/agents/${agent._id}`}>
                        <div className="entity-icon">
                          <i className={`fas fa-robot ${agent.type?.toLowerCase() || 'default'}`}></i>
                        </div>
                        <div className="entity-info">
                          <h4>{agent.name || 'Unnamed Agent'}</h4>
                          <p>{(agent.description || 'No description').substring(0, 60)}...</p>
                        </div>
                        <div className="entity-meta">
                          <span className={`status-badge status-${agent.status?.toLowerCase() || 'unknown'}`}>
                            {agent.status || 'Unknown'}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3>Recent Tools</h3>
              <Link to="/tools">View All</Link>
            </div>
            <div className="card-body">
              {!toolsArray.length ? (
                <div className="empty-state compact">
                  <p>No tools registered yet</p>
                  <Link to="/tools/new" className="btn btn-sm btn-primary">
                    Register Tool
                  </Link>
                </div>
              ) : (
                <ul className="entity-list">
                  {toolsArray.slice(0, 3).map(tool => (
                    <li key={tool._id} className="entity-item">
                      <Link to={`/tools/${tool._id}`}>
                        <div className="entity-icon">
                          <i className={`fas fa-tools ${tool.type?.toLowerCase() || 'default'}`}></i>
                        </div>
                        <div className="entity-info">
                          <h4>{tool.name || 'Unnamed Tool'}</h4>
                          <p>{(tool.description || 'No description').substring(0, 60)}...</p>
                        </div>
                        <div className="entity-meta">
                          <span className={`method-badge method-${(tool.method || 'get').toLowerCase()}`}>
                            {tool.method || 'GET'}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid-column">
          <RecentActivity logs={logsArray} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;