// Import necessary libraries
const axios = require('axios');
const dotenv = require('dotenv');
//const logger = require('logger-library'); // Replace 'logger-library' with your preferred logging library

// Load environment variables from .env file
dotenv.config();

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.API_BASE_URL, // Read API base URL from environment variable
  timeout: 5000, // Set request timeout (adjust as needed)
});

// Add authentication headers to each request
api.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${process.env.API_TOKEN}`; // Read API token from environment variable
  return config;
});

// Logging interceptor to log requests and responses
api.interceptors.request.use((config) => {
 // logger.log(`Request: ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
  //  logger.log(`Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
   // logger.error(`Error: ${error.response.status} ${error.response.statusText}`);
    return Promise.reject(error);
  }
);

// CRUD operations
const crud = {
  // GET request
  get: async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
     // logger.error(`Failed to perform GET request: ${error.message}`);
      throw error;
    }
  },

  // POST request
  post: async (endpoint, data) => {
    try {
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error) {
      logger.error(`Failed to perform POST request: ${error.message}`);
      throw error;
    }
  },

  // PUT request
  put: async (endpoint, data) => {
    try {
      const response = await api.put(endpoint, data);
      return response.data;
    } catch (error) {
      logger.error(`Failed to perform PUT request: ${error.message}`);
      throw error;
    }
  },

  // DELETE request
  del: async (endpoint) => {
    try {
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error) {
      logger.error(`Failed to perform DELETE request: ${error.message}`);
      throw error;
    }
  },
};

// Library utility method to set the base URL dynamically
const use = (baseURL) => {
  api.defaults.baseURL = baseURL;
};

// Export the CRUD functions and 'use' method
module.exports = {
  ...crud,
  use,
};
