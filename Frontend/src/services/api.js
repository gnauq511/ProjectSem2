import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Ensure this is true for session cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 