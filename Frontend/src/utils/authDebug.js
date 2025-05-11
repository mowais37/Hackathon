// src/utils/authDebug.js
/**
 * Utility to debug authentication issues
 */
import axios from 'axios';
/**
 * Check token in localStorage and current headers
 * @returns {Object} Debug information about token status
 */
export const checkAuthToken = () => {
    const token = localStorage.getItem('token');
    const authHeader = axios.defaults.headers.common['Authorization'];
    
    return {
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 10)}...` : 'None',
      headerSet: !!authHeader,
      headerValue: authHeader ? authHeader : 'None',
      isPotentiallyValid: token && token.split('.').length === 3 // Basic JWT format check
    };
  };
  
  /**
   * Log information about authentication status
   */
  export const logAuthStatus = () => {
    const status = checkAuthToken();
    console.group('Authentication Status');
    console.log('Token in localStorage:', status.hasToken);
    console.log('Token value:', status.tokenValue);
    console.log('Auth header set:', status.headerSet);
    console.log('Auth header:', status.headerValue);
    console.log('Token format valid:', status.isPotentiallyValid);
    console.groupEnd();
    
    return status;
  };
  
  // Simple debugging function that can be called directly
  export const debugAuth = () => {
    const status = logAuthStatus();
    
    if (!status.hasToken) {
      console.error('No token found in localStorage. User may need to log in again.');
    } else if (!status.headerSet) {
      console.error('Token exists but Authorization header is not set. Check setAuthToken.js');
    } else if (!status.isPotentiallyValid) {
      console.error('Token does not appear to be in valid JWT format.');
    } else {
      console.log('Token exists and appears to be properly set in headers.');
    }
  };
  
  export default debugAuth;