const express = require('express');
const router = express.Router();
const {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All chat routes require authentication
router.use(protect);

// Conversations
router.route('/conversations')
  .get(getMyConversations)
  .post(getOrCreateConversation);

// Messages within a conversation
router.route('/conversations/:conversationId/messages')
  .get(getMessages)
  .post(sendMessage);

module.exports = router;
