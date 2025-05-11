// src/context/tool/ToolState.js
import React, { useReducer } from 'react';
import axios from 'axios';
import ToolContext from './toolContext';
import toolReducer from './toolReducer';
import {
  GET_TOOLS,
  ADD_TOOL,
  DELETE_TOOL,
  SET_CURRENT,
  CLEAR_CURRENT,
  UPDATE_TOOL,
  FILTER_TOOLS,
  CLEAR_FILTER,
  TOOL_ERROR,
  CLEAR_TOOLS,
  GET_TOOL_TYPES,
  SET_LOADING
} from './types';

const ToolState = props => {
  const initialState = {
    tools: [],
    toolTypes: ['GitHub', 'Slack', 'Jira', 'Shopify', 'Speech', 'Custom'],
    current: null,
    filtered: null,
    error: null,
    loading: false
  };

  const [state, dispatch] = useReducer(toolReducer, initialState);

  // Get Tools
  const getTools = async () => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.get('/api/tools');

      dispatch({
        type: GET_TOOLS,
        payload: res.data.data || res.data
      });
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.msg || err.message || 'Failed to fetch tools'
      });
    }
  };

  // Get Tool by ID
  const getToolById = async (id) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.get(`/api/tools/${id}`);

      dispatch({
        type: SET_CURRENT,
        payload: res.data.data || res.data
      });
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to fetch tool ${id}`
      });
    }
  };

  // Get Tool Types
  const getToolTypes = async () => {
    try {
      dispatch({ type: SET_LOADING });
      
      // In a real app, you would fetch these from the API
      // const res = await axios.get('/api/tools/types');
      
      dispatch({
        type: GET_TOOL_TYPES,
        payload: state.toolTypes
      });
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.msg || err.message || 'Failed to fetch tool types'
      });
    }
  };

  // Add Tool
  const addTool = async tool => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post('/api/tools', tool, config);

      dispatch({
        type: ADD_TOOL,
        payload: res.data.data || res.data
      });
      
      return res.data.data || res.data;
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.msg || err.message || 'Failed to add tool'
      });
      throw err;
    }
  };

  // Delete Tool
  const deleteTool = async id => {
    try {
      dispatch({ type: SET_LOADING });
      
      await axios.delete(`/api/tools/${id}`);

      dispatch({
        type: DELETE_TOOL,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to delete tool ${id}`
      });
    }
  };

  // Update Tool
  const updateTool = async tool => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.put(
        `/api/tools/${tool._id}`,
        tool,
        config
      );

      dispatch({
        type: UPDATE_TOOL,
        payload: res.data.data || res.data
      });
      
      return res.data.data || res.data;
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to update tool ${tool._id}`
      });
      throw err;
    }
  };

  // Execute Tool
  const executeTool = async (id, action, params = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post(
        `/api/tools/${id}/execute`,
        { action, params },
        config
      );

      return res.data.data || res.data;
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to execute tool ${id} action ${action}`
      });
      throw err;
    }
  };

  // Register Tool
  const registerTool = async (id) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post(`/api/tools/${id}/register`);
      
      dispatch({
        type: UPDATE_TOOL,
        payload: res.data.data || res.data
      });
      
      return res.data.data || res.data;
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to register tool ${id}`
      });
      throw err;
    }
  };

  // Deregister Tool
  const deregisterTool = async (id) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post(`/api/tools/${id}/deregister`);
      
      dispatch({
        type: UPDATE_TOOL,
        payload: res.data.data || res.data
      });
      
      return res.data.data || res.data;
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.msg || err.message || `Failed to deregister tool ${id}`
      });
      throw err;
    }
  };

  // Clear Tools
  const clearTools = () => {
    dispatch({ type: CLEAR_TOOLS });
  };

  // Set Current Tool
  const setCurrent = tool => {
    dispatch({ type: SET_CURRENT, payload: tool });
  };

  // Clear Current Tool
  const clearCurrent = () => {
    dispatch({ type: CLEAR_CURRENT });
  };

  // Filter Tools
  const filterTools = text => {
    dispatch({ type: FILTER_TOOLS, payload: text });
  };

  // Clear Filter
  const clearFilter = () => {
    dispatch({ type: CLEAR_FILTER });
  };

  return (
    <ToolContext.Provider
      value={{
        tools: state.tools,
        toolTypes: state.toolTypes,
        current: state.current,
        filtered: state.filtered,
        error: state.error,
        loading: state.loading,
        getTools,
        getToolById,
        getToolTypes,
        addTool,
        deleteTool,
        setCurrent,
        clearCurrent,
        updateTool,
        executeTool,
        registerTool,
        deregisterTool,
        filterTools,
        clearFilter,
        clearTools
      }}
    >
      {props.children}
    </ToolContext.Provider>
  );
};

export default ToolState;