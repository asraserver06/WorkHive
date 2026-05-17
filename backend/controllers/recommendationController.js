const Job = require('../models/Job');
const Application = require('../models/Application');

// ─────────────────────────────────────────────────────────────
// @desc    Get personalised job recommendations for a student
// @route   GET /api/recommendations
// @access  Private (Student)
//
// Algorithm:
//  1. Fetch the student's skills from their profile.
//  2. Find open jobs that require at least one of those skills.
//  3. Score each job by the number of skill matches.
//  4. Exclude jobs the student already applied to.
//  5. Return top 10 jobs sorted by match score.
// ─────────────────────────────────────────────────────────────
exports.getRecommendations = async (req, res) => {
  try {
    const userSkills = (req.user.skills || []).map((s) => s.toLowerCase());

    // IDs of jobs the user already applied to
    const appliedApplications = await Application.find({
      applicant: req.user.id,
    }).select('job');
    const appliedJobIds = appliedApplications.map((a) => a.job.toString());

    // Fetch all open jobs NOT already applied to
    const openJobs = await Job.find({
      status: 'Open',
      _id: { $nin: appliedJobIds },
    })
      .populate('recruiter', 'name email company')
      .lean();

    // If the student has no skills yet, return latest open jobs
    if (userSkills.length === 0) {
      const latest = openJobs
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map((job) => ({ ...job, matchScore: 0, matchedSkills: [] }));

      return res.status(200).json({
        message:
          'No skills set on profile – showing latest open jobs. Add skills to your profile for personalised matches.',
        recommendations: latest,
      });
    }

    // Score jobs by skill overlap
    const scored = openJobs
      .map((job) => {
        const jobSkills = (job.skillsRequired || []).map((s) => s.toLowerCase());
        const matchedSkills = userSkills.filter((s) => jobSkills.includes(s));
        return {
          ...job,
          matchScore: matchedSkills.length,
          matchedSkills,
        };
      })
      .filter((job) => job.matchScore > 0) // Only jobs with at least 1 match
      .sort((a, b) => b.matchScore - a.matchScore) // Highest match first
      .slice(0, 10);

    // If no skill matches at all, fall back to latest open jobs
    if (scored.length === 0) {
      const fallback = openJobs
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map((job) => ({ ...job, matchScore: 0, matchedSkills: [] }));

      return res.status(200).json({
        message:
          'No direct skill matches found – showing latest open jobs. Update your skills for better recommendations.',
        recommendations: fallback,
      });
    }

    res.status(200).json({
      message: `Found ${scored.length} recommended job(s) based on your skills.`,
      recommendations: scored,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update the student's skill set (used by profile)
// @route   PUT /api/recommendations/skills
// @access  Private (Student)
// ─────────────────────────────────────────────────────────────
const User = require('../models/User');

exports.updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: '`skills` must be an array of strings' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { skills },
      { new: true }
    ).select('-password');

    res.status(200).json({ message: 'Skills updated', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
