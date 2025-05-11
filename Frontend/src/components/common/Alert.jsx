// src/components/common/Alert.jsx
import React, { useContext } from 'react';
import AuthContext from '../../context/auth/authContext';
import AgentContext from '../../context/agent/agentContext';
import ToolContext from '../../context/tool/toolContext';
import LogContext from '../../context/log/logContext';

const Alert = () => {
  const authContext = useContext(AuthContext);
  const agentContext = useContext(AgentContext);
  const toolContext = useContext(ToolContext);
  const logContext = useContext(LogContext);

  return (
    <div className="alert-container">
      {authContext.error && (
        <div className="alert alert-danger">
          <i className="fas fa-info-circle"></i> {authContext.error}
        </div>
      )}
      {agentContext.error && (
        <div className="alert alert-danger">
          <i className="fas fa-info-circle"></i> {agentContext.error}
        </div>
      )}
      {toolContext.error && (
        <div className="alert alert-danger">
          <i className="fas fa-info-circle"></i> {toolContext.error}
        </div>
      )}
      {logContext.error && (
        <div className="alert alert-danger">
          <i className="fas fa-info-circle"></i> {logContext.error}
        </div>
      )}
    </div>
  );
};

export default Alert;