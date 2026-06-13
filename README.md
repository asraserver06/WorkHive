<div align="center">

<br/>

```
 ██████╗ █████╗ ██████╗ ███████╗███████╗██████╗     ██████╗  ██████╗ ██████╗ ████████╗ █████╗ ██╗     
██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗    ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗██║     
██║     ███████║██████╔╝█████╗  █████╗  ██████╔╝    ██████╔╝██║   ██║██████╔╝   ██║   ███████║██║     
██║     ██╔══██║██╔══██╗██╔══╝  ██╔══╝  ██╔══██╗    ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══██║██║     
╚██████╗██║  ██║██║  ██║███████╗███████╗██║  ██║    ██║     ╚██████╔╝██║  ██║   ██║   ██║  ██║███████╗
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
```

### 🚀 *Your AI-Powered Gateway to the Perfect Career*

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<br/>

> **"Not just a job board — a career companion powered by AI."**

<br/>

</div>

---

## 🌟 What is Career Portal?

**Career Portal** is a full-stack, AI-enhanced Smart Career & Internship Platform built on the **MERN stack**. It bridges the gap between ambitious job seekers and forward-thinking recruiters — all under one intelligent roof.

Whether you're a **fresh graduate** hunting your first internship or an **experienced recruiter** looking for the perfect fit, Career Portal puts the power of **Google Gemini AI**, **real-time messaging**, and **intelligent resume analysis** right at your fingertips.

---

## ✨ Feature Highlights

<table>
<tr>
<td width="50%">

### 🤖 AI Resume Analyzer
Upload your resume as a PDF and let **Google Gemini AI** dissect it — extracting skills, spotting gaps, and giving you actionable improvement suggestions in seconds.

</td>
<td width="50%">

### 🎯 Smart Job Recommendations
Forget endless scrolling. Our engine matches your **skill profile** against live job listings and surfaces only the roles you're truly suited for.

</td>
</tr>
<tr>
<td width="50%">

### 💬 Real-Time Chat
Built on **Socket.io**, candidates and recruiters communicate instantly — no email chains, no delays. Direct, live conversations inside the platform.

</td>
<td width="50%">

### 🔐 Role-Based Auth
Two distinct worlds — **Candidates** and **Recruiters** — each with their own dashboard, permissions, and experience. Secured with **JWT + bcrypt**.

</td>
</tr>
<tr>
<td width="50%">

### 📋 Application Tracker
Track every job you've applied to with live status updates: `Pending → Reviewed → Accepted / Rejected`. Never lose track of an opportunity again.

</td>
<td width="50%">

### 📊 Recruiter Dashboard
Post jobs, manage listings, review applications, and chat with candidates — all from a single, elegant recruiter workspace.

</td>
</tr>
</table>

---

## 🗂️ Project Architecture

```
career-portal/
│
├── 📁 backend/                     # Node.js + Express REST API
│   ├── 📁 controllers/             # Business logic handlers
│   │   ├── authController.js       # Register, login, JWT issuing
│   │   ├── jobController.js        # CRUD for job listings
│   │   ├── applicationController.js# Apply, track, update status
│   │   ├── resumeController.js     # PDF parse + Gemini AI analysis
│   │   ├── chatController.js       # Message history & real-time events
│   │   └── recommendationController.js  # Skill-based job matching
│   ├── 📁 models/                  # Mongoose schemas
│   │   ├── User.js                 # Candidate & Recruiter model
│   │   ├── Job.js                  # Job listing schema
│   │   ├── Application.js          # Application tracking
│   │   └── Message.js              # Chat message model
│   ├── 📁 routes/                  # Express route definitions
│   ├── 📁 middleware/              # Auth guard (JWT verification)
│   ├── 📁 utils/                   # Helper utilities
│   ├── 📁 uploads/                 # Multer file storage (resumes)
│   └── server.js                   # App entry point + Socket.io setup
│
├── 📁 frontend/                    # React 19 + Vite SPA
│   └── 📁 src/
│       ├── 📁 pages/               # Route-level page components
│       │   ├── LandingPage.jsx     # Public home page
│       │   ├── AuthPage.jsx        # Login / Register
│       │   ├── DashboardPage.jsx   # Role-aware main dashboard
│       │   ├── JobsPage.jsx        # Browse all job listings
│       │   ├── JobDetailPage.jsx   # Single job view & apply
│       │   ├── ResumeAnalyzerPage.jsx  # AI resume upload & results
│       │   ├── RecommendationsPage.jsx # Personalized job matches
│       │   └── ChatPage.jsx        # Real-time messaging UI
│       ├── 📁 components/          # Reusable UI components
│       ├── 📁 context/             # React Context (Auth state)
│       └── 📁 api/                 # Axios API client
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## ⚡ Tech Stack Deep Dive

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Blazing-fast SPA with HMR |
| **Routing** | React Router DOM v7 | Client-side navigation |
| **State** | React Context API | Global auth & user state |
| **HTTP Client** | Axios | API requests with interceptors |
| **UI Icons** | Lucide React | Clean, consistent iconography |
| **Notifications** | React Hot Toast | Non-intrusive toast alerts |
| **Backend** | Node.js + Express 5 | REST API server |
| **Database** | MongoDB + Mongoose 9 | Document-based data storage |
| **Auth & Security** | JWT, bcrypt, Helmet, Rate-Limit | Stateless auth, headers, injection & brute-force protection |
| **Real-Time** | Socket.io 4 | WebSocket-powered live chat |
| **AI Engine** | Google Gemini AI | Resume analysis & smart suggestions |
| **File Upload** | Multer | PDF resume handling |
| **PDF Parsing** | pdf-parse | Extract raw text from resumes |
| **Email** | Nodemailer | Notification emails |
| **Dev Server** | Nodemon | Auto-restart on file changes |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- **Node.js** v18+ → [nodejs.org](https://nodejs.org)
- **MongoDB** (local or [MongoDB Atlas](https://cloud.mongodb.com))
- A **Google Gemini API Key** → [ai.google.dev](https://ai.google.dev)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/asraserver06/career-portal.git
cd career-portal
```

### 2️⃣ Setup the Backend

```bash
cd backend
npm install
```

Create your environment file:

```bash
# backend/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/career-portal
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Start the backend dev server:

```bash
npm run dev
# Server running at → http://localhost:5000
```

### 3️⃣ Setup the Frontend

```bash
cd ../frontend
npm install
npm run dev
# App running at → http://localhost:5173
```

---

## 🔌 API Reference

### 🔑 Auth Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login & receive JWT | Public |
| `GET` | `/api/auth/me` | Get current user profile | Private |

### 💼 Job Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/jobs` | Fetch all open jobs | Public |
| `GET` | `/api/jobs/:id` | Single job details | Public |
| `POST` | `/api/jobs` | Create new job listing | Recruiter |
| `PUT` | `/api/jobs/:id` | Update job listing | Recruiter |
| `DELETE` | `/api/jobs/:id` | Remove job listing | Recruiter |

### 📝 Application Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/applications` | Apply to a job | Candidate |
| `GET` | `/api/applications/my` | My applications | Candidate |
| `GET` | `/api/applications/job/:id` | Applicants for a job | Recruiter |
| `PUT` | `/api/applications/:id` | Update status | Recruiter |

### 🤖 AI & Smart Features
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/resume/analyze` | Upload & analyze resume (PDF) | Candidate |
| `GET` | `/api/recommendations` | Skill-matched job suggestions | Candidate |

### 💬 Chat Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/chat/:userId` | Fetch message history | Private |
| `POST` | `/api/chat` | Send a message | Private |

---

## 🧠 How AI Resume Analysis Works

```
┌─────────────┐     PDF Upload      ┌──────────────┐
│   Candidate  │ ──────────────────► │    Multer    │
│   (Browser)  │                     │  File Store  │
└─────────────┘                     └──────┬───────┘
                                           │ Extract Text
                                    ┌──────▼───────┐
                                    │  pdf-parse   │
                                    └──────┬───────┘
                                           │ Raw Resume Text
                                    ┌──────▼───────────────┐
                                    │   Google Gemini AI   │
                                    │  (Structured Prompt) │
                                    └──────┬───────────────┘
                                           │ JSON Analysis
                              ┌────────────▼────────────────┐
                              │  Skills • Gaps • Suggestions │
                              │  Score • Strengths • Summary │
                              └─────────────────────────────┘
```

---

## 🔒 Security Architecture

- 🛡️ **Password Hashing** — bcryptjs with salt rounds (no plain-text passwords ever stored).
- 🎫 **JWT Tokens** — Stateless authentication with expiry enforcement.
- 🚧 **Route Guards** — Middleware protects every private endpoint.
- 👥 **Role Enforcement** — Recruiter-only and Candidate-only routes are strictly separated.
- 📁 **File Validation & Limits** — Only PDF uploads accepted (max 5MB) preventing memory-exhaustion.
- 🌐 **CORS & HTTP Headers** — Restricted origins and `helmet` package for robust header security (XSS, Clickjacking prevention).
- 🛑 **Rate Limiting** — `express-rate-limit` protects API endpoints from brute-force and DDoS attacks.
- 💉 **NoSQL Injection Protection** — `express-mongo-sanitize` strips out prohibited payload characters (`$`, `.`).
- 🔑 **Environment Secrets** — All sensitive keys loaded from `.env` and safely ignored via `.gitignore`.

---

## 📱 Pages Overview

| Page | Route | Description |
|---|---|---|
| 🏠 Landing | `/` | Hero section, features, call-to-action |
| 🔐 Auth | `/auth` | Unified Login / Register with role selection |
| 📊 Dashboard | `/dashboard` | Role-aware home — jobs posted or applications |
| 💼 Jobs | `/jobs` | Browse & search all live job listings |
| 🔍 Job Detail | `/jobs/:id` | Full job info, skills, one-click apply |
| 🤖 Resume AI | `/resume` | Upload PDF, get AI-powered feedback |
| 🎯 Recommendations | `/recommendations` | Personalized skill-matched job matches |
| 💬 Chat | `/chat` | Real-time messaging with connections |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** this repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "feat: add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

<div align="center">

**Developed with 💙 by [asraserver06](https://github.com/asraserver06)**

*Smart Career & Internship Portal — Empowering careers through AI*

<br/>

⭐ **If this project helped you, consider giving it a star!** ⭐

</div>
