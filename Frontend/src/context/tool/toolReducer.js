// src/context/tool/toolReducer.js
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
  
  const toolReducer = (state, action) => {
    switch (action.type) {
      case GET_TOOLS:
        return {
          ...state,
          tools: action.payload,
          loading: false
        };
      case GET_TOOL_TYPES:
        return {
          ...state,
          toolTypes: action.payload,
          loading: false
        };
      case ADD_TOOL:
        return {
          ...state,
          tools: [action.payload, ...state.tools],
          loading: false
        };
      case UPDATE_TOOL:
        return {
          ...state,
          tools: state.tools.map(tool =>
            tool._id === action.payload._id ? action.payload : tool
          ),
          loading: false
        };
      case DELETE_TOOL:
        return {
          ...state,
          tools: state.tools.filter(tool => tool._id !== action.payload),
          loading: false
        };
      case CLEAR_TOOLS:
        return {
          ...state,
          tools: [],
          filtered: null,
          error: null,
          current: null
        };
      case SET_CURRENT:
        return {
          ...state,
          current: action.payload
        };
      case CLEAR_CURRENT:
        return {
          ...state,
          current: null
        };
      case FILTER_TOOLS:
        return {
          ...state,
          filtered: state.tools.filter(tool => {
            const regex = new RegExp(`${action.payload}`, 'gi');
            return tool.name.match(regex) || tool.type.match(regex);
          })
        };
      case CLEAR_FILTER:
        return {
          ...state,
          filtered: null
        };
      case TOOL_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false
        };
      case SET_LOADING:
        return {
          ...state,
          loading: true
        };
      default:
        return state;
    }
  };
  
  export default toolReducer;