// src/context/agent/agentReducer.js
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

const agentReducer = (state, action) => {
  switch (action.type) {
    case GET_AGENTS:
      return {
        ...state,
        agents: Array.isArray(action.payload) ? action.payload : [],
        loading: false
      };
    case ADD_AGENT:
      return {
        ...state,
        agents: Array.isArray(state.agents) 
          ? [action.payload, ...state.agents] 
          : [action.payload],
        loading: false
      };
    case UPDATE_AGENT:
      return {
        ...state,
        agents: Array.isArray(state.agents)
          ? state.agents.map(agent =>
              agent._id === action.payload._id ? action.payload : agent
            )
          : [],
        loading: false
      };
    case DELETE_AGENT:
      return {
        ...state,
        agents: Array.isArray(state.agents)
          ? state.agents.filter(agent => agent._id !== action.payload)
          : [],
        loading: false
      };
    case CLEAR_AGENTS:
      return {
        ...state,
        agents: [],
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
    case FILTER_AGENTS:
      return {
        ...state,
        filtered: Array.isArray(state.agents)
          ? state.agents.filter(agent => {
              if (!agent) return false;
              const regex = new RegExp(`${action.payload}`, 'gi');
              return (
                (agent.name && agent.name.match(regex)) || 
                (agent.type && agent.type.match(regex))
              );
            })
          : []
      };
    case CLEAR_FILTER:
      return {
        ...state,
        filtered: null
      };
    case AGENT_ERROR:
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
    case QUERY_AGENT:
      return {
        ...state,
        queryResults: action.payload,
        queryLoading: false
      };
    case QUERY_ERROR:
      return {
        ...state,
        queryError: action.payload,
        queryLoading: false
      };
    default:
      return state;
  }
};

export default agentReducer;