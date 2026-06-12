const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// ─────────────────────────────────────────────────────────────
// @desc    Get or create a conversation between current user and another user
// @route   POST /api/chat/conversations
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }

    if (recipientId === currentUserId) {
      return res.status(400).json({ message: 'Cannot start a conversation with yourself' });
    }

    // Check if conversation already exists (order of participants doesn't matter)
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId] },
    })
      .populate('participants', 'name email role')
      .lean();

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, recipientId],
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email role')
        .lean();
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all conversations for the current user
// @route   GET /api/chat/conversations
// @access  Private
// ─────────────────────────────────────────────────────────────
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate('participants', 'name email role')
      .sort('-lastMessageAt')
      .lean();

    // Fetch unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          readBy: { $ne: req.user.id },
        });
        return { ...conv, unreadCount };
      })
    );

    res.status(200).json(conversationsWithUnread);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all messages in a conversation
// @route   GET /api/chat/conversations/:conversationId/messages
// @access  Private (must be a participant)
// ─────────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify the user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view this conversation' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name role')
      .sort('createdAt')
      .lean();

    // Mark all messages as read by the current user
    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Send a message (REST fallback – primary path is Socket.io)
// @route   POST /api/chat/conversations/:conversationId/messages
// @access  Private (must be a participant)
// ─────────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    // Verify the user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res
        .status(403)
        .json({ message: 'Not authorized to send messages here' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text: text.trim(),
      readBy: [req.user.id],
    });

    // Update conversation's last message snapshot
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text.trim(),
      lastMessageAt: new Date(),
    });

    const populated = await message.populate('sender', 'name role');

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
