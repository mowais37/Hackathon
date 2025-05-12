// src/pages/Chat.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import AgentConsole from '../components/agents/AgentConsole';
import AgentContext from '../context/agent/agentContext';
import { useContext } from 'react';
import Loading from '../components/common/Loading';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get('agent');
  const agentContext = useContext(AgentContext);
  const { getAgentById, current, loading, clearCurrent } = agentContext;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Redirect to agents page if no agent ID is provided
    if (!agentId) {
      setIsLoaded(true);
      return;
    }

    // Load agent data
    getAgentById(agentId);
    setIsLoaded(true);

    // Cleanup on unmount
    return () => {
      clearCurrent();
    };
    // eslint-disable-next-line
  }, [agentId]);

//   if (!isLoaded || loading) {
//     return <Loading />;
//   }

  // Redirect to agents page if no agent ID is provided
  if (!agentId) {
    return <Navigate to="/agents" />;
  }

  return <AgentConsole id={agentId} />;
};

export default Chat;