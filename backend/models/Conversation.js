const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // Array of exactly 2 users (student + recruiter)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Snapshot of the last message for quick list display
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure a conversation between two users is unique
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
