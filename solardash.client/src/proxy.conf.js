// Import the 'process' module to access environment variables
const { env } = require('process');

// Determine the target URL for the proxy based on environment variables
// If ASPNETCORE_HTTPS_PORT is set, use it to construct the target URL
// Otherwise, if ASPNETCORE_URLS is set, use the first URL in the list
// If neither is set, default to 'https://localhost:7082'
const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
    ? env.ASPNETCORE_URLS.split(';')[0]
    : 'https://localhost:7082';

// Define the proxy configuration
const PROXY_CONFIG = [
  {
    // Specify the context paths to be proxied
    context: [
      "/api" // Proxy requests starting with '/api'
    ],
    target, // The target URL determined above
    secure: false, // Disable SSL verification for the proxy
    changeOrigin: true // Modify the origin header to match the target
  }
];

// Export the proxy configuration for use in the application
module.exports = PROXY_CONFIG;
