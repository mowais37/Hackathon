// src/context/agent/AgentState.js
import React, { useReducer } from 'react';
import axios from 'axios';
import AgentContext from './agentContext';
import agentReducer from './agentReducer';
import {
  GET_AGENTS,
  ADD_AGENT,
  DELETE_AGENT,
  SET_CURRENT,
  CLEAR_CURRENT,
  UPDATE_AGENT,
  FILTER_AGENTS,
  CLEAR_FILTER,
  AGENT_ERROR,
  CLEAR_AGENTS,
  SET_LOADING,
  QUERY_AGENT,
  QUERY_ERROR
} from './types';

const AgentState = props => {
  const initialState = {
    agents: [],
    current: null,
    filtered: null,
    error: null,
    loading: false,
    queryResults: null,
    queryLoading: false,
    queryError: null
  };

  const [state, dispatch] = useReducer(agentReducer, initialState);

  // Get Agents
  const getAgents = async () => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.get('/api/agents');

      dispatch({
        type: GET_AGENTS,
        payload: res.data.data || res.data
      });
    } catch (err) {
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.msg || err.message || 'Failed to fetch agents'
      });
    }
  };

  // Get Agent by ID
  const getAgentById = async (id) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.get(`/api/agents/${id}`);

      dispatch({
        type: SET_CURRENT,
        payload: res.data.data || res.data
      });
    } catch (err) {
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to fetch agent ${id}`
      });
    }
  };

  // Add Agent
  const addAgent = async agent => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post('/api/agents', agent, config);

      dispatch({
        type: ADD_AGENT,
        payload: res.data.data || res.data
      });
      
      return res.data.data || res.data;
    } catch (err) {
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.msg || err.message || 'Failed to add agent'
      });
      throw err;
    }
  };

  // Delete Agent
  const deleteAgent = async id => {
    try {
      dispatch({ type: SET_LOADING });
      
      await axios.delete(`/api/agents/${id}`);

      dispatch({
        type: DELETE_AGENT,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to delete agent ${id}`
      });
    }
  };

  // Update Agent
  const updateAgent = async agent => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.put(
        `/api/agents/${agent._id}`,
        agent,
        config
      );

      dispatch({
        type: UPDATE_AGENT,
        payload: res.data.data || res.data
      });
      
      return res.data.data || res.data;
    } catch (err) {
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to update agent ${agent._id}`
      });
      throw err;
    }
  };

  // Query Agent
  const queryAgent = async (id, query) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post(
        `/api/agents/${id}/query`,
        { query },
        config
      );

      dispatch({
        type: QUERY_AGENT,
        payload: res.data.data || res.data
      });
      
      return res.data.data || res.data;
    } catch (err) {
      dispatch({
        type: QUERY_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to query agent ${id}`
      });
      throw err;
    }
  };

  // Register Agent
  const registerAgent = async (id) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post(`/api/agents/${id}/register`);
      
      dispatch({
        type: UPDATE_AGENT,
        payload: res.data.data || res.data
      });
      
      return res.data.data || res.data;
    } catch (err) {
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to register agent ${id}`
      });
      throw err;
    }
  };

  // Deregister Agent
  const deregisterAgent = async (id) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post(`/api/agents/${id}/deregister`);
      
      dispatch({
        type: UPDATE_AGENT,
        payload: res.data.data || res.data
      });
      
      return res.data.data || res.data;
    } catch (err) {
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to deregister agent ${id}`
      });
      throw err;
    }
  };

  // Clear Agents
  const clearAgents = () => {
    dispatch({ type: CLEAR_AGENTS });
  };

  // Set Current Agent
  const setCurrent = agent => {
    dispatch({ type: SET_CURRENT, payload: agent });
  };

  // Clear Current Agent
  const clearCurrent = () => {
    dispatch({ type: CLEAR_CURRENT });
  };

  // Filter Agents
  const filterAgents = text => {
    dispatch({ type: FILTER_AGENTS, payload: text });
  };

  // Clear Filter
  const clearFilter = () => {
    dispatch({ type: CLEAR_FILTER });
  };

  return (
    <AgentContext.Provider
      value={{
        agents: state.agents,
        current: state.current,
        filtered: state.filtered,
        error: state.error,
        loading: state.loading,
        queryResults: state.queryResults,
        queryLoading: state.queryLoading,
        queryError: state.queryError,
        getAgents,
        getAgentById,
        addAgent,
        deleteAgent,
        setCurrent,
        clearCurrent,
        updateAgent,
        filterAgents,
        clearFilter,
        clearAgents,
        queryAgent,
        registerAgent,
        deregisterAgent
      }}
    >
      {props.children}
    </AgentContext.Provider>
  );
};

export default AgentState;