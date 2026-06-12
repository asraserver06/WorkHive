const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const {
  sendApplicationConfirmation,
  sendNewApplicantAlert,
  sendStatusUpdateEmail,
} = require('../utils/emailService');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Student)
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, resumeUrl } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      resumeUrl
    });

    // ── Email: confirm to student + alert recruiter ──────────
    const recruiter = await User.findById(job.recruiter).select('name email');
    const student   = req.user; // attached by authMiddleware

    sendApplicationConfirmation({
      studentName:  student.name,
      studentEmail: student.email,
      jobTitle:     job.title,
      company:      job.company,
    }).catch((err) => console.error('Application confirmation email failed:', err.message));

    if (recruiter) {
      sendNewApplicantAlert({
        recruiterEmail: recruiter.email,
        recruiterName:  recruiter.name,
        studentName:    student.name,
        jobTitle:       job.title,
      }).catch((err) => console.error('New applicant alert email failed:', err.message));
    }

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current student's applications
// @route   GET /api/applications/my-applications
// @access  Private (Student)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location status')
      .sort('-createdAt');
      
    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter/Admin)
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Make sure user is the job owner or admin
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email skills resumeUrl')
      .sort('-createdAt');

    // BLIND MATCHMAKING: Hide candidate details if not revealed
    const responseApplications = applications.map((app, index) => {
      let appObj = app.toObject();
      if (!appObj.isRevealed && appObj.applicant) {
        appObj.applicant.name = `Candidate #${index + 1}`;
        appObj.applicant.email = "Hidden in Blind Mode";
        appObj.resumeUrl = "Hidden in Blind Mode";
        if (appObj.applicant.resumeUrl) appObj.applicant.resumeUrl = "Hidden in Blind Mode";
      }
      return appObj;
    });

    res.status(200).json(responseApplications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter/Admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    let application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Make sure user is the job owner or admin
    if (application.job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    // ── Email: notify student of status change ───────────────
    const student = await User.findById(application.applicant).select('name email');
    if (student) {
      sendStatusUpdateEmail({
        studentName:  student.name,
        studentEmail: student.email,
        jobTitle:     application.job.title,
        company:      application.job.company,
        status,
      }).catch((err) => console.error('Status update email failed:', err.message));
    }

    res.status(200).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reveal candidate details (Blind Matchmaking)
// @route   PUT /api/applications/:id/reveal
// @access  Private (Recruiter/Admin)
exports.revealApplication = async (req, res) => {
  try {
    let application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to reveal this application' });
    }

    application.isRevealed = true;
    await application.save();

    // Populate the applicant so the frontend can display their real details
    await application.populate('applicant', 'name email skills resumeUrl');

    res.status(200).json({ message: 'Candidate revealed successfully', application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
