require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// Model imports for Socket.io handlers
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const User = require('./models/User');

// ── Express app ──────────────────────────────────────────────
const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));

// ── Database Connection ───────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ── REST Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.get('/', (_req, res) => {
  res.json({
    message: 'WorkHive API 🚀',
    version: '1.0.0',
    endpoints: [
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'GET    /api/auth/me',
      'GET    /api/jobs',
      'POST   /api/jobs',
      'GET    /api/jobs/:id',
      'PUT    /api/jobs/:id',
      'DELETE /api/jobs/:id',
      'POST   /api/applications',
      'GET    /api/applications/my-applications',
      'GET    /api/applications/job/:jobId',
      'PUT    /api/applications/:id/status',
      'POST   /api/resume/analyze',
      'GET    /api/chat/conversations',
      'POST   /api/chat/conversations',
      'GET    /api/chat/conversations/:id/messages',
      'POST   /api/chat/conversations/:id/messages',
      'GET    /api/recommendations',
      'PUT    /api/recommendations/skills',
    ],
  });
});

// ── Serverless Export ─────────────────────────────────────────
module.exports.handler = serverless(app);