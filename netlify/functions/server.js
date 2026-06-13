// Netlify serverless function wrapper
// Re-exports the handler from the backend with cached DB connection
const { handler } = require('../../backend/server');
exports.handler = handler;
