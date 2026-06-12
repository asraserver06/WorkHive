const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const stream = require('stream');
const User = require('../models/User');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// @desc    Upload resume and analyze with AI
// @route   POST /api/resume/analyze
// @access  Private (Student)
exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF resume' });
    }

    // 1. Read the PDF file from memory buffer
    const dataBuffer = req.file.buffer;
    
    // 2. Parse text from PDF
    const data = await pdfParse(dataBuffer);
    const resumeText = data.text;

    // Optional: Get job description if provided for matching
    const { jobDescription } = req.body;

    // 3. Analyze with Gemini
    let aiFeedback = null;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        let prompt = `Analyze the following resume text. Extract the key skills, experience level, and provide 3 brief bullet points of constructive feedback to improve it.\n\nResume Text: ${resumeText.substring(0, 3000)}`;
        
        if (jobDescription) {
          prompt += `\n\nAdditionally, compare it against this job description and provide a match percentage and missing skills:\n${jobDescription.substring(0, 1000)}`;
        }

        const result = await model.generateContent(prompt);
        aiFeedback = result.response.text();
      } catch (aiError) {
        console.error('AI Analysis Failed:', aiError);
        aiFeedback = "AI analysis is currently unavailable. Please verify your Gemini API key.";
      }
    } else {
      aiFeedback = "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file to enable AI analysis.";
    }

    // 4. Save to GridFS
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'resumes'
    });
    
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);
    
    const filename = `${req.user.id}-${Date.now()}.pdf`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype
    });
    
    bufferStream.pipe(uploadStream);
    
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });
    
    // 5. Save resumeUrl to User model
    const fileId = uploadStream.id;
    await User.findByIdAndUpdate(req.user.id, {
      resumeUrl: `/api/resume/download/${fileId}`
    });

    // 6. Return results
    res.status(200).json({
      message: 'Resume uploaded and analyzed successfully',
      extractedTextPreview: resumeText.substring(0, 200) + '...',
      aiFeedback,
      resumeUrl: `/api/resume/download/${fileId}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during resume analysis' });
  }
};

// @desc    Download/View a resume
// @route   GET /api/resume/download/:fileId
// @access  Public (or add protect if needed)
exports.getResume = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'resumes'
    });

    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    
    // Check if file exists
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${files[0].filename}"`);
    
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving resume' });
  }
};
