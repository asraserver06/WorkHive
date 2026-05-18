const nodemailer = require('nodemailer');

// ── Mailtrap Transporter ──────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ── Shared HTML wrapper ───────────────────────────────────────
const htmlWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin: 0; padding: 0; background: #0f172a; font-family: 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 40px auto; background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 36px 40px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p  { margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 14px; }
    .body { padding: 36px 40px; color: #cbd5e1; font-size: 15px; line-height: 1.7; }
    .body h2 { color: #f1f5f9; font-size: 20px; margin: 0 0 12px; }
    .badge { display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; margin: 12px 0; }
    .badge-applied   { background: #1d4ed8; color: #bfdbfe; }
    .badge-interview { background: #d97706; color: #fef3c7; }
    .badge-offer     { background: #059669; color: #d1fae5; }
    .badge-rejected  { background: #dc2626; color: #fee2e2; }
    .badge-success   { background: #059669; color: #d1fae5; }
    .btn { display: inline-block; margin-top: 24px; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
    .divider { border: none; border-top: 1px solid #334155; margin: 24px 0; }
    .footer { background: #0f172a; padding: 20px 40px; text-align: center; color: #475569; font-size: 13px; }
    .job-card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px 24px; margin: 16px 0; }
    .job-card h3 { margin: 0 0 6px; color: #f1f5f9; font-size: 17px; }
    .job-card p  { margin: 0; color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Smart Career Portal</h1>
      <p>Your gateway to the perfect opportunity</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">© ${new Date().getFullYear()} Smart Career Portal · All rights reserved</div>
  </div>
</body>
</html>
`;

// ── 1. Welcome Email (on registration) ───────────────────────
const sendWelcomeEmail = async ({ name, email, role }) => {
  const roleLabel = role === 'recruiter' ? 'Recruiter' : 'Student';
  const tip =
    role === 'recruiter'
      ? 'Start by posting your first job listing to attract top talent.'
      : 'Explore jobs, upload your resume for AI analysis, and track your applications.';

  const html = htmlWrapper(`
    <h2>Welcome aboard, ${name}! 🎉</h2>
    <p>Your <strong>${roleLabel}</strong> account is ready. We're excited to have you on the platform.</p>
    <div class="job-card">
      <h3>💡 Getting Started</h3>
      <p>${tip}</p>
    </div>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard →</a>
    <hr class="divider"/>
    <p style="font-size:13px;color:#64748b;">If you didn't create this account, please ignore this email.</p>
  `);

  await transporter.sendMail({
    from: `"Smart Career Portal" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to: email,
    subject: `Welcome to Smart Career Portal, ${name}! 🎉`,
    html,
  });
};

// ── 2. Application Confirmation (student applied) ─────────────
const sendApplicationConfirmation = async ({ studentName, studentEmail, jobTitle, company }) => {
  const html = htmlWrapper(`
    <h2>Application Submitted! ✅</h2>
    <p>Hi <strong>${studentName}</strong>, your application has been received.</p>
    <div class="job-card">
      <h3>${jobTitle}</h3>
      <p>${company}</p>
    </div>
    <span class="badge badge-applied">● Applied</span>
    <p>The recruiter will review your profile and update the status. You can track progress on your dashboard.</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Track Application →</a>
  `);

  await transporter.sendMail({
    from: `"Smart Career Portal" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to: studentEmail,
    subject: `Application Submitted — ${jobTitle} at ${company}`,
    html,
  });
};

// ── 3. Application Status Update (recruiter changed status) ───
const sendStatusUpdateEmail = async ({ studentName, studentEmail, jobTitle, company, status }) => {
  const statusConfig = {
    Interview: {
      badge: 'badge-interview',
      emoji: '🎯',
      headline: "You've been shortlisted for an interview!",
      message: `Congratulations! The recruiter at <strong>${company}</strong> wants to interview you for <strong>${jobTitle}</strong>. Check your dashboard for further instructions.`,
    },
    Offer: {
      badge: 'badge-offer',
      emoji: '🏆',
      headline: "You've received a job offer!",
      message: `Outstanding news! <strong>${company}</strong> has extended an offer for the <strong>${jobTitle}</strong> position. Log in to review and respond.`,
    },
    Rejected: {
      badge: 'badge-rejected',
      emoji: '📋',
      headline: 'Application update',
      message: `Thank you for your interest in <strong>${jobTitle}</strong> at <strong>${company}</strong>. After careful consideration, the recruiter has decided to move forward with other candidates. Don't give up — keep applying!`,
    },
  };

  const cfg = statusConfig[status] || {
    badge: 'badge-applied',
    emoji: '📌',
    headline: 'Application status updated',
    message: `Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated to <strong>${status}</strong>.`,
  };

  const html = htmlWrapper(`
    <h2>${cfg.emoji} ${cfg.headline}</h2>
    <p>Hi <strong>${studentName}</strong>,</p>
    <div class="job-card">
      <h3>${jobTitle}</h3>
      <p>${company}</p>
    </div>
    <span class="badge ${cfg.badge}">● ${status}</span>
    <p>${cfg.message}</p>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">View Dashboard →</a>
  `);

  await transporter.sendMail({
    from: `"Smart Career Portal" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to: studentEmail,
    subject: `Application Update: ${status} — ${jobTitle} at ${company}`,
    html,
  });
};

// ── 4. New Applicant Alert (notify recruiter) ─────────────────
const sendNewApplicantAlert = async ({ recruiterEmail, recruiterName, studentName, jobTitle }) => {
  const html = htmlWrapper(`
    <h2>📬 New Application Received</h2>
    <p>Hi <strong>${recruiterName}</strong>,</p>
    <p><strong>${studentName}</strong> has just applied for your job posting:</p>
    <div class="job-card">
      <h3>${jobTitle}</h3>
      <p>Review the applicant's profile and update their status.</p>
    </div>
    <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Review Applicant →</a>
  `);

  await transporter.sendMail({
    from: `"Smart Career Portal" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to: recruiterEmail,
    subject: `New Applicant for "${jobTitle}" — ${studentName}`,
    html,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendApplicationConfirmation,
  sendStatusUpdateEmail,
  sendNewApplicantAlert,
};
