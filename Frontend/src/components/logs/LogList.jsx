// components/logs/LogList.jsx
import React, { useContext, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import LogContext from "../../context/log/logContext";
import AgentContext from "../../context/agent/agentContext";
import ToolContext from "../../context/tool/toolContext";
import LogItem from "./LogItem";
import Loading from "../common/Loading";

const LogList = () => {
  const logContext = useContext(LogContext);
  const {
    logs,
    getLogs,
    getAgentLogs,
    getToolLogs,
    pagination,
    loading,
    error,
  } = logContext;

  const agentContext = useContext(AgentContext);
  const { agents, getAgents } = agentContext;

  const toolContext = useContext(ToolContext);
  const { tools, getTools } = toolContext;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const agentId = queryParams.get("agent");
  const toolId = queryParams.get("tool");

  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get source name (agent or tool name)
  const [sourceName, setSourceName] = useState("");

  useEffect(() => {
    // Load logs based on parameters
    if (agentId) {
      getAgentLogs(agentId, currentPage);

      // Load agents if not loaded
      if (!agents.length) {
        getAgents();
      }
    } else if (toolId) {
      getToolLogs(toolId, currentPage);

      // Load tools if not loaded
      if (!tools.length) {
        getTools();
      }
    } else {
      getLogs(currentPage);
    }
    // eslint-disable-next-line
  }, [currentPage, agentId, toolId]);

  // Set source name when data is loaded
  useEffect(() => {
    if (agentId && agents.length) {
      const agent = agents.find((a) => a._id === agentId);
      setSourceName(agent ? agent.name : "Unknown Agent");
    } else if (toolId && tools.length) {
      const tool = tools.find((t) => t._id === toolId);
      setSourceName(tool ? tool.name : "Unknown Tool");
    }
  }, [agentId, toolId, agents, tools]);

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const onFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  // Filter logs based on search term and type filter
  const filteredLogs = logs?.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.agentName &&
        log.agentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.toolName &&
        log.toolName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filter === "all" || log.type === filter;

    return matchesSearch && matchesFilter;
  });

  if (loading && logs.length === 0) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Logs</h3>
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (agentId) {
              getAgentLogs(agentId, currentPage);
            } else if (toolId) {
              getToolLogs(toolId, currentPage);
            } else {
              getLogs(currentPage);
            }
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="log-list-container">
      <div className="log-list-header">
        <h2>
          {agentId
            ? `Logs for Agent: ${sourceName}`
            : toolId
            ? `Logs for Tool: ${sourceName}`
            : "Activity Logs"}
        </h2>

        <div className="log-list-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={onSearchChange}
            />
            <i className="fas fa-search"></i>
          </div>

          {(agentId || toolId) && (
            <Link to="/logs" className="btn btn-secondary">
              View All Logs
            </Link>
          )}
        </div>
      </div>

      <div className="log-filter-bar">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => onFilterChange("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === "query" ? "active" : ""}`}
          onClick={() => onFilterChange("query")}
        >
          Queries
        </button>
        <button
          className={`filter-btn ${filter === "action" ? "active" : ""}`}
          onClick={() => onFilterChange("action")}
        >
          Actions
        </button>
        <button
          className={`filter-btn ${filter === "error" ? "active" : ""}`}
          onClick={() => onFilterChange("error")}
        >
          Errors
        </button>
        <button
          className={`filter-btn ${filter === "system" ? "active" : ""}`}
          onClick={() => onFilterChange("system")}
        >
          System
        </button>
      </div>

      {filteredLogs?.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-clipboard-list fa-4x"></i>
          <h3>No logs found</h3>
          <p>No activity logs matching your criteria</p>
        </div>
      ) : (
        <>
          <div className="log-table-container">
            <table className="log-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <LogItem key={log._id} log={log} />
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  className={`pagination-btn ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-btn"
                disabled={currentPage === pagination.totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LogList;

// CSS for Log Components
/*
.log-list-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.log-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.log-list-header h2 {
  margin: 0;
}

.log-list-actions {
  display: flex;
  gap: 1rem;
}

.search-box {
  position: relative;
}

.search-box input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
}

.search-box i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.log-filter-bar {
  display: flex;
  padding: 1rem 1.5rem;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background-color: #f0f0f0;
}

.filter-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.log-table-container {
  overflow-x: auto;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
}

.log-table th,
.log-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.log-table th {
  background-color: #f8f8f8;
  font-weight: 600;
}

.log-row:hover {
  background-color: #f9f9f9;
}

.log-timestamp {
  white-space: nowrap;
  color: #666;
  font-size: 0.9rem;
}

.log-type .type-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-query {
  background-color: #e3f2fd;
  color: #2196f3;
}

.type-action {
  background-color: #e8f5e9;
  color: #4caf50;
}

.type-error {
  background-color: #ffebee;
  color: #f44336;
}

.type-system {
  background-color: #f3e5f5;
  color: #9c27b0;
}

.log-message {
  max-width: 400px;
}

.log-source .source-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3498db;
  text-decoration: none;
}

.log-source .source-link i {
  color: #666;
}

.log-source .source-system {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.log-status .status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-success {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-failed {
  background-color: #ffebee;
  color: #f44336;
}

.status-pending {
  background-color: #fff8e1;
  color: #ffc107;
}

.log-actions .btn-icon {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.log-actions .btn-icon:hover {
  background-color: #f0f0f0;
}

.log-details-row td {
  padding: 0;
}

.log-details {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.details-section {
  margin-bottom: 1.5rem;
}

.details-section:last-child {
  margin-bottom: 0;
}

.details-section h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #333;
  font-size: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.details-item {
  display: flex;
  gap: 0.5rem;
}

.details-item strong {
  color: #666;
}

.details-content {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #eee;
}

.details-code {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #eee;
  overflow-x: auto;
}

.details-code pre {
  margin: 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.pagination-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #999;
}

.empty-state i {
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: #666;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.error-container h3 {
  color: #e74c3c;
  margin-bottom: 0.5rem;
}

.error-container p {
  color: #666;
  margin-bottom: 1.5rem;
}
*/
