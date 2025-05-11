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
    toolTypes: [],
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
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response.msg
      });
    }
  };

  // Get Tool Types
  const getToolTypes = async () => {
    try {
      dispatch({ type: SET_LOADING });
      
      const res = await axios.get('/api/tools/types');

      dispatch({
        type: GET_TOOL_TYPES,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response.msg
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
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response.msg
      });
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
        payload: err.response.msg
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
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: TOOL_ERROR,
        payload: err.response.msg
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