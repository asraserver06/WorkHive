const fs = require('fs');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('🚀 Testing Resume Analyzer Endpoint with a Real PDF...\n');
  
  try {
    // 1. Register a student
    console.log('👤 Registering a test student...');
    const studentRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: `test_resume_${Date.now()}@test.com`,
        password: 'password123',
        role: 'student'
      })
    });
    const studentData = await studentRes.json();
    console.log('✅ Student Registered! Token:', studentData.token.substring(0, 20) + '...');

    // 2. Upload the resume
    console.log('\n📄 Uploading test_resume.pdf for AI analysis...');
    
    // In Node 18+, we use FormData and Blob
    const form = new FormData();
    const fileBuffer = fs.readFileSync('test_resume.pdf');
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    form.append('resume', blob, 'test_resume.pdf');
    form.append('jobDescription', 'Looking for a software engineer with testing experience.');

    const analyzeRes = await fetch(`${API_URL}/resume/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentData.token}`
      },
      body: form
    });
    
    const analyzeData = await analyzeRes.json();
    
    console.log('\n✨ Analysis Result:');
    console.log('Message:', analyzeData.message);
    console.log('Extracted Text Preview:', analyzeData.extractedTextPreview);
    console.log('AI Feedback:', analyzeData.aiFeedback);
    
    console.log('\n🎉 Resume Analyzer Test Finished Successfully!');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

runTest();
