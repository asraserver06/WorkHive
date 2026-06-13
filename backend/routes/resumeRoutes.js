const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { analyzeResume, getResume } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configure Multer for PDF uploads using memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});


router.post('/analyze', protect, authorize('student'), upload.single('resume'), analyzeResume);
router.get('/download/:fileId', getResume);

module.exports = router;
