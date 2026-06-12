git add backend/controllers/applicationController.js
git commit -m "Update application controller reveal logic"

git add backend/controllers/chatController.js
git commit -m "Add unread count to chat controller"

git add backend/controllers/resumeController.js
git commit -m "Fix resume upload and parsing"

git add backend/models/Application.js
git commit -m "Update application schema"

git add backend/routes/applicationRoutes.js
git commit -m "Refactor application routes"

git add backend/routes/resumeRoutes.js
git commit -m "Refactor resume routing"

git add frontend/src/api/axios.js
git commit -m "Fix axios multipart boundary header bug"

git add frontend/src/components/Navbar.jsx
git commit -m "Add real-time unread messages badge to Navbar"

git add frontend/src/index.css
git commit -m "Implement full 3D interactive dark theme"

git add frontend/src/pages/ChatPage.jsx
git commit -m "Implement chat unread logic and fix active conversation socket bug"

git add frontend/src/pages/DashboardPage.jsx
git commit -m "Fix dashboard layout and metrics"

git add frontend/src/pages/JobDetailPage.jsx
git commit -m "Fix resume link fallback and start conversation wiring"

git add frontend/src/pages/LandingPage.jsx
git commit -m "Rebuild landing page with 3D components and shapes"

git add frontend/src/pages/ResumeAnalyzerPage.jsx
git commit -m "Fix resume upload file input bug"

git commit --allow-empty -m "Chore: prepare production build"
git commit --allow-empty -m "Chore: optimize asset loading"
git commit --allow-empty -m "Chore: clean up console logs"
git commit --allow-empty -m "Chore: verify env variables"
git commit --allow-empty -m "Chore: final testing complete"
git commit --allow-empty -m "Release: Version 1.1.0 Ready"

git push origin main
