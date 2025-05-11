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
      
      // Extract agents data from response, ensuring it's an array
      let agentsData = [];
      
      if (res.data && res.data.data) {
        // If the API returns data in a nested data property
        agentsData = Array.isArray(res.data.data) ? res.data.data : [];
      } else if (res.data) {
        // If the API returns data directly
        agentsData = Array.isArray(res.data) ? res.data : [];
      }
      
      console.log('Fetched agents data:', agentsData);

      dispatch({
        type: GET_AGENTS,
        payload: agentsData
      });
    } catch (err) {
      console.error('Error fetching agents:', err);
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.message || 'Error fetching agents'
      });
    }
  };

  // Get Agent by ID
  const getAgentById = async (id) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.get(`/api/agents/${id}`);
      
      // Extract agent data from response
      const agentData = res.data?.data || res.data;
      
      console.log('Fetched agent data:', agentData);

      dispatch({
        type: SET_CURRENT,
        payload: agentData
      });
      
      return agentData;
    } catch (err) {
      console.error(`Error fetching agent ${id}:`, err);
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.message || `Error fetching agent ${id}`
      });
    }
  };

  // Add Agent
  const addAgent = async agent => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post('/api/agents', agent);
      
      // Extract created agent data from response
      const createdAgent = res.data?.data || res.data;
      
      console.log('Created agent:', createdAgent);

      dispatch({
        type: ADD_AGENT,
        payload: createdAgent
      });
      
      return createdAgent;
    } catch (err) {
      console.error('Error creating agent:', err);
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.message || 'Error creating agent'
      });
    }
  };

  // Update Agent
  const updateAgent = async agent => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.put(`/api/agents/${agent._id}`, agent);
      
      // Extract updated agent data from response
      const updatedAgent = res.data?.data || res.data;
      
      console.log('Updated agent:', updatedAgent);

      dispatch({
        type: UPDATE_AGENT,
        payload: updatedAgent
      });
      
      return updatedAgent;
    } catch (err) {
      console.error(`Error updating agent ${agent._id}:`, err);
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.message || 'Error updating agent'
      });
    }
  };

  // Delete Agent
  const deleteAgent = async id => {
    try {
      dispatch({ type: SET_LOADING });
      
      await axios.delete(`/api/agents/${id}`);
      
      console.log('Deleted agent:', id);

      dispatch({
        type: DELETE_AGENT,
        payload: id
      });
    } catch (err) {
      console.error(`Error deleting agent ${id}:`, err);
      dispatch({
        type: AGENT_ERROR,
        payload: err.response?.data?.message || 'Error deleting agent'
      });
    }
  };

  // Query Agent
  const queryAgent = async (id, prompt) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post(`/api/agents/${id}/query`, { query: prompt });
      
      // Extract query result from response
      const queryResult = res.data?.data || res.data;
      
      console.log('Agent query result:', queryResult);

      dispatch({
        type: QUERY_AGENT,
        payload: queryResult
      });
      
      return queryResult;
    } catch (err) {
      console.error(`Error querying agent ${id}:`, err);
      dispatch({
        type: QUERY_ERROR,
        payload: err.response?.data?.message || 'Error querying agent'
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
        queryAgent
      }}
    >
      {props.children}
    </AgentContext.Provider>
  );
};

export default AgentState;