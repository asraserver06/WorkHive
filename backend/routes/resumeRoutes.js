const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { analyzeResume } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configure Multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}.pdf`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

router.post('/analyze', protect, authorize('student'), upload.single('resume'), analyzeResume);

module.exports = router;
