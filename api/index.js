const app = require('../backend/server');
const { connectDB } = require('../backend/server');

module.exports = async function handler(req, res) {
  await connectDB();
  app(req, res);
};
