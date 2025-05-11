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
    toolTypes: ['GitHub', 'Slack', 'Jira', 'Shopify', 'Custom'],
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
      
      console.log('Fetching tools...');
      const res = await axios.get('/api/tools');
      console.log('Tools API response:', res.data);
      
      // Extract tools data from response, ensuring it's an array
      let toolsData = [];
      
      if (res.data && res.data.data) {
        // If the API returns data in a nested data property
        toolsData = Array.isArray(res.data.data) ? res.data.data : [];
      } else if (res.data) {
        // If the API returns data directly
        toolsData = Array.isArray(res.data) ? res.data : [];
      }
      
      console.log('Processed tools data:', toolsData);

      dispatch({
        type: GET_TOOLS,
        payload: toolsData
      });
    } catch (err) {
      console.error('Error fetching tools:', err);
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.message || 'Error fetching tools'
      });
    }
  };

  // Get Tool Types
  const getToolTypes = async () => {
    try {
      dispatch({ type: SET_LOADING });
      
      // Try to fetch tool types from API if available
      try {
        const res = await axios.get('/api/tools/types');
        
        if (res.data && Array.isArray(res.data)) {
          dispatch({
            type: GET_TOOL_TYPES,
            payload: res.data
          });
        } else {
          // Fallback to default types if API doesn't return an array
          dispatch({
            type: GET_TOOL_TYPES,
            payload: initialState.toolTypes
          });
        }
      } catch (err) {
        // If endpoint doesn't exist, use default types
        console.log('Tool types API not available, using defaults');
        dispatch({
          type: GET_TOOL_TYPES,
          payload: initialState.toolTypes
        });
      }
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: 'Error fetching tool types'
      });
    }
  };

  // Add Tool
  const addTool = async tool => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.post('/api/tools', tool);
      
      // Extract created tool data from response
      const createdTool = res.data?.data || res.data;
      
      console.log('Created tool:', createdTool);

      dispatch({
        type: ADD_TOOL,
        payload: createdTool
      });
      
      return createdTool;
    } catch (err) {
      console.error('Error creating tool:', err);
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.message || 'Error creating tool'
      });
    }
  };

  // Delete Tool
  const deleteTool = async id => {
    try {
      dispatch({ type: SET_LOADING });
      
      await axios.delete(`/api/tools/${id}`);
      
      console.log('Deleted tool:', id);

      dispatch({
        type: DELETE_TOOL,
        payload: id
      });
    } catch (err) {
      console.error(`Error deleting tool ${id}:`, err);
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.message || 'Error deleting tool'
      });
    }
  };

  // Update Tool
  const updateTool = async tool => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.put(`/api/tools/${tool._id}`, tool);
      
      // Extract updated tool data from response
      const updatedTool = res.data?.data || res.data;
      
      console.log('Updated tool:', updatedTool);

      dispatch({
        type: UPDATE_TOOL,
        payload: updatedTool
      });
      
      return updatedTool;
    } catch (err) {
      console.error(`Error updating tool ${tool._id}:`, err);
      dispatch({
        type: TOOL_ERROR,
        payload: err.response?.data?.message || 'Error updating tool'
      });
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
        getToolTypes,
        addTool,
        deleteTool,
        setCurrent,
        clearCurrent,
        updateTool,
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