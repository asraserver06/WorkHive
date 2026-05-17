const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

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

    // 1. Read the PDF file
    const dataBuffer = fs.readFileSync(req.file.path);
    
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

    // Clean up the uploaded file to save space (since we extracted text)
    fs.unlinkSync(req.file.path);

    // 4. Return results
    res.status(200).json({
      message: 'Resume analyzed successfully',
      extractedTextPreview: resumeText.substring(0, 200) + '...',
      aiFeedback
    });

  } catch (error) {
    console.error(error);
    // Cleanup on error too
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error during resume analysis' });
  }
};
