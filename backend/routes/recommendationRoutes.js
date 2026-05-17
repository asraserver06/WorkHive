const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  updateSkills,
} = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/recommendations  – personalised job list for a student
router.get('/', protect, authorize('student'), getRecommendations);

// PUT /api/recommendations/skills  – update student's skill set
router.put('/skills', protect, authorize('student'), updateSkills);

module.exports = router;
