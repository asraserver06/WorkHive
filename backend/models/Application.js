const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Interview', 'Rejected', 'Offered'],
    default: 'Applied'
  }
}, { timestamps: true });

// Prevent multiple applications by the same user for the same job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
