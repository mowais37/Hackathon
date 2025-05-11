// src/utils/setAuthToken.js
import axios from 'axios';

/**
 * Sets or removes the authorization token in axios headers
 * @param {string} token - JWT token to set, or null to remove
 */
const setAuthToken = token => {
  if (token) {
    // For standard Authorization Bearer token header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Also set x-auth-token header as fallback for backends that expect it
    axios.defaults.headers.common['x-auth-token'] = token;
    
    console.log('Auth token set in axios headers');
  } else {
    // Remove both header types if token is not provided
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['x-auth-token'];
    
    console.log('Auth token removed from axios headers');
  }
};

export default setAuthToken;