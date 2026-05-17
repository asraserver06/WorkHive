require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

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
const httpServer = http.createServer(app);

// ── Socket.io server ─────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));

// Attach io to every request so controllers can emit events if needed
app.use((req, _res, next) => {
  req.io = io;
  next();
});

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
    message: 'Smart Career Portal API 🚀',
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

// ── Socket.io – Real-time Chat ────────────────────────────────
//
// Authentication middleware: validate JWT on every socket connection
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: no token'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('Authentication error: user not found'));

    socket.user = user; // Attach user to socket
    next();
  } catch (err) {
    next(new Error('Authentication error: invalid token'));
  }
});

// Track online users: userId → socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.user._id.toString();
  onlineUsers.set(userId, socket.id);

  console.log(`🟢 User connected: ${socket.user.name} (${userId})`);

  // Broadcast updated online users list
  io.emit('onlineUsers', Array.from(onlineUsers.keys()));

  // ── Join a conversation room ──────────────────────────────
  socket.on('joinConversation', async (conversationId) => {
    try {
      // Verify the user is actually a participant
      const convo = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });
      if (!convo) {
        socket.emit('error', { message: 'Not authorized for this conversation' });
        return;
      }
      socket.join(conversationId);
      socket.emit('joinedConversation', { conversationId });
    } catch (err) {
      socket.emit('error', { message: 'Could not join conversation' });
    }
  });

  // ── Send a message ────────────────────────────────────────
  socket.on('sendMessage', async ({ conversationId, text }) => {
    try {
      if (!text || !text.trim()) return;

      // Verify participant
      const convo = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });
      if (!convo) {
        socket.emit('error', { message: 'Not authorized for this conversation' });
        return;
      }

      // Persist to DB
      const message = await Message.create({
        conversation: conversationId,
        sender: userId,
        text: text.trim(),
        readBy: [userId],
      });

      // Update conversation snapshot
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text.trim(),
        lastMessageAt: new Date(),
      });

      const populated = await message.populate('sender', 'name role');

      // Broadcast to everyone in the room (including sender)
      io.to(conversationId).emit('newMessage', populated);

      // Notify the other participant even if not in the room
      convo.participants.forEach((participantId) => {
        const pid = participantId.toString();
        if (pid !== userId && onlineUsers.has(pid)) {
          io.to(onlineUsers.get(pid)).emit('conversationUpdated', {
            conversationId,
            lastMessage: text.trim(),
            lastMessageAt: new Date(),
          });
        }
      });
    } catch (err) {
      console.error('sendMessage error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // ── Typing indicators ─────────────────────────────────────
  socket.on('typing', ({ conversationId }) => {
    socket.to(conversationId).emit('userTyping', {
      userId,
      name: socket.user.name,
    });
  });

  socket.on('stopTyping', ({ conversationId }) => {
    socket.to(conversationId).emit('userStoppedTyping', { userId });
  });

  // ── Disconnect ────────────────────────────────────────────
  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log(`🔴 User disconnected: ${socket.user.name} (${userId})`);
  });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready`);
});