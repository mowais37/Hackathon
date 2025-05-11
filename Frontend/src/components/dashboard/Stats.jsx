// src/components/dashboard/Stats.jsx
import React from "react";
import PropTypes from "prop-types";
import "../../assets/styles/Stats.css"; // Assuming you have a CSS file for styling

const Stats = ({ stats }) => {
  // Ensure stats is an object
  const safeStats = stats || {};

  // Safe access to stats with defaults
  const totalAgents = safeStats.totalAgents || 0;
  const activeAgents = safeStats.activeAgents || 0;
  const totalTools = safeStats.totalTools || 0;
  const successRate = safeStats.successRate || 0;

  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-icon">
          <i className="fas fa-robot"></i>
        </div>
        <div className="stat-content">
          <h3>{totalAgents}</h3>
          <p>Total Agents</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <div className="stat-content">
          <h3>{activeAgents}</h3>
          <p>Active Agents</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <i className="fas fa-tools"></i>
        </div>
        <div className="stat-content">
          <h3>{totalTools}</h3>
          <p>Registered Tools</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <i className="fas fa-percent"></i>
        </div>
        <div className="stat-content">
          <h3>{successRate}%</h3>
          <p>Success Rate</p>
        </div>
      </div>
    </div>
  );
};

Stats.propTypes = {
  stats: PropTypes.object.isRequired,
};

// Default props
Stats.defaultProps = {
  stats: {
    totalAgents: 0,
    activeAgents: 0,
    totalTools: 0,
    successRate: 0,
  },
};

export default Stats;
