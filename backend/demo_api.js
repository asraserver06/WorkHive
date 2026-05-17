// Quick script to demo the Backend API flow
const API_URL = 'http://localhost:5000/api';

async function runDemo() {
  console.log('🚀 Starting Backend API Demo...\n');

  try {
    // 1. Register Recruiter
    console.log('👤 Registering a Recruiter...');
    const recruiterRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tech Corp Recruiter',
        email: `recruiter_${Date.now()}@test.com`,
        password: 'password123',
        role: 'recruiter'
      })
    });
    const recruiterData = await recruiterRes.json();
    console.log('✅ Recruiter Registered! Token:', recruiterData.token.substring(0, 20) + '...\n');

    // 2. Register Student
    console.log('👤 Registering a Student...');
    const studentRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: `student_${Date.now()}@test.com`,
        password: 'password123',
        role: 'student'
      })
    });
    const studentData = await studentRes.json();
    console.log('✅ Student Registered! Token:', studentData.token.substring(0, 20) + '...\n');

    // 3. Recruiter Posts a Job
    console.log('💼 Recruiter is posting a new Job...');
    const jobRes = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterData.token}`
      },
      body: JSON.stringify({
        title: 'Frontend Developer',
        description: 'Looking for a React expert to build awesome UIs.',
        company: 'Tech Corp',
        location: 'Remote',
        skillsRequired: ['React', 'JavaScript', 'CSS']
      })
    });
    const jobData = await jobRes.json();
    console.log('✅ Job Posted successfully!');
    console.log(`   Title: ${jobData.title} at ${jobData.company}\n`);

    // 4. Student views all Jobs
    console.log('🔍 Student is browsing all available Jobs...');
    const allJobsRes = await fetch(`${API_URL}/jobs`);
    const allJobsData = await allJobsRes.json();
    console.log(`✅ Found ${allJobsData.length} job(s) in the database.\n`);

    // 5. Student applies for the Job
    console.log('📝 Student is applying for the new job...');
    const applyRes = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentData.token}`
      },
      body: JSON.stringify({
        jobId: jobData._id,
        resumeUrl: 'https://example.com/jane_doe_resume.pdf'
      })
    });
    const applyData = await applyRes.json();
    console.log('✅ Application submitted successfully!');
    console.log(`   Status: ${applyData.status}\n`);

    // 6. Recruiter checks applications for their Job
    console.log('👀 Recruiter is checking applications for their job...');
    const appsRes = await fetch(`${API_URL}/applications/job/${jobData._id}`, {
      headers: {
        'Authorization': `Bearer ${recruiterData.token}`
      }
    });
    const appsData = await appsRes.json();
    console.log(`✅ Found ${appsData.length} application(s) for the job.`);
    console.log(`   Applicant Name: ${appsData[0].applicant.name}`);
    console.log(`   Resume URL: ${appsData[0].resumeUrl}\n`);
    
    console.log('🎉 Demo Finished Successfully! The backend API is working perfectly.');

  } catch (error) {
    console.error('❌ Error during demo:', error);
  }
}

runDemo();
