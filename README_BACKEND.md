# Million Words Challenge - Backend Setup Guide

## 📋 What Was Created

### Frontend Files
1. **submit.html** - Story submission page for users
2. **admin.html** - Admin panel for moderating stories
3. **story-integration.js** - Script to connect overlay with backend

### Backend Files
1. **server.js** - Node.js/Express API server
2. **package.json** - Node.js dependencies
3. **.gitignore** - Git ignore file

---

## 🚀 Quick Start Guide

### Step 1: Install Node.js
If you don't have Node.js installed:
- Download from: https://nodejs.org/
- Install the LTS (Long Term Support) version

### Step 2: Install Dependencies
Open terminal in your project directory and run:
```bash
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `nodemon` - Auto-restart during development (optional)

### Step 3: Start the Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

You should see:
```
🚀 Million Words Challenge Backend
📡 Server running on http://localhost:3000
📝 Story submission: http://localhost:3000/submit.html
⚙️  Admin panel: http://localhost:3000/admin.html
```

### Step 4: Update Admin Password
⚠️ **IMPORTANT**: Before deploying, change the admin password!

Edit `admin.html` line ~98:
```javascript
if (password === 'admin123') { // Change this password!
```

Replace `'admin123'` with a strong password.

### Step 5: Integrate with Overlay
Add this line to your `index.html` before the closing `</body>` tag:
```html
<script src="story-integration.js"></script>
```

---

## 📡 API Endpoints

### Public Endpoints
- `POST /api/submit-story` - Submit a new story
- `GET /api/stories/approved` - Get approved stories for overlay

### Admin Endpoints (add authentication in production!)
- `GET /api/stories` - Get all stories
- `POST /api/stories/:id/approve` - Approve a story
- `POST /api/stories/:id/reject` - Reject a story
- `DELETE /api/stories/:id` - Delete a story
- `POST /api/users/:username/ban` - Ban a user
- `GET /api/users/banned` - Get banned users list

---

## 🛡️ Content Filtering

The backend automatically filters:
- ✅ Profanity and inappropriate language
- ✅ Excessive violence keywords
- ✅ EXCESSIVE CAPS (yelling)
- ✅ Spam and repetitive content
- ✅ Stories under 50 words

### Customize Filters
Edit `server.js` to modify:
- `BANNED_WORDS` array (line ~13)
- `VIOLENCE_KEYWORDS` array (line ~18)
- `checkContent()` function (line ~63)

---

## ⏱️ Story Rotation System

Stories automatically expire based on submission volume:
- **< 10 stories**: 2 days
- **< 50 stories**: 1 day
- **< 100 stories**: 12 hours
- **100+ stories**: 6 hours minimum

Expired stories are automatically filtered from the overlay.

---

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Easy & Free Tier)
1. Create account at https://railway.app/
2. Click "New Project" → "Deploy from GitHub"
3. Connect your repository
4. Railway auto-detects Node.js and deploys!
5. Get your deployment URL (e.g., `your-app.railway.app`)

### Option 2: Vercel (Serverless)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts to deploy
4. Note: Need to create `vercel.json` for API routes

### Option 3: Render
1. Create account at https://render.com/
2. New Web Service → Connect repository
3. Build command: `npm install`
4. Start command: `npm start`

### Option 4: Your Own Server
If you have a VPS or dedicated server:
```bash
# Install PM2 for process management
npm install -g pm2

# Start server
pm2 start server.js --name "mwc-backend"

# Make it start on reboot
pm2 startup
pm2 save
```

---

## 🔗 Update Frontend After Deployment

After deploying, update these files with your backend URL:

### In `submit.html` (line ~166):
```javascript
const response = await fetch('YOUR_BACKEND_URL/api/submit-story', {
```

### In `admin.html` (line ~233):
```javascript
const API_BASE = 'YOUR_BACKEND_URL/api';
```

### In `story-integration.js` (line ~5):
```javascript
const API_BASE = 'YOUR_BACKEND_URL/api';
```

---

## 📊 Data Storage

Stories are stored in: `data/stories.json`
Banned users in: `data/banned-users.json`

**Backup regularly!** These are JSON files that can be manually edited if needed.

---

## 🔒 Security Considerations

### Before Going Live:
1. ✅ Change admin password in `admin.html`
2. ✅ Add proper authentication (JWT, sessions, etc.)
3. ✅ Use environment variables for sensitive data
4. ✅ Add rate limiting to prevent spam
5. ✅ Set up HTTPS (most hosting providers include this)
6. ✅ Consider using a database (MongoDB, PostgreSQL) instead of JSON files

### Quick Security Enhancement:
Create a `.env` file:
```
ADMIN_PASSWORD=your_secure_password_here
PORT=3000
```

Install `dotenv`: `npm install dotenv`

Update `server.js` (add at top):
```javascript
require('dotenv').config();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
```

---

## 🧪 Testing

### Test Story Submission:
```bash
curl -X POST http://localhost:3000/api/submit-story \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "title": "Test Story",
    "story": "This is a test story with more than fifty words to meet the minimum requirement. We need to make sure the content filtering works and that stories are properly stored in the system.",
    "wordCount": 35,
    "genre": "fantasy"
  }'
```

### Test Getting Approved Stories:
```bash
curl http://localhost:3000/api/stories/approved
```

---

## 🆘 Troubleshooting

### Port Already in Use
Change port in `server.js` or set environment variable:
```bash
PORT=3001 npm start
```

### Stories Not Showing in Overlay
1. Check browser console for errors
2. Verify `story-integration.js` is loaded
3. Check if overlay has `showStoryTicker` function
4. Test API endpoint directly: `http://localhost:3000/api/stories/approved`

### File Permission Errors
Make sure the `data/` directory is writable:
```bash
chmod 755 data/
```

---

## 📞 Support

If you need help:
1. Check the browser console for errors (F12)
2. Check server logs in terminal
3. Verify all files are in the correct location
4. Test API endpoints with curl or Postman

---

## 🎉 You're All Set!

Your story submission system is ready to use:
- Users submit at: `https://millionwordschallengeoverlay.kodair.us/submit.html`
- You moderate at: `https://millionwordschallengeoverlay.kodair.us/admin.html`
- Stories appear automatically on your overlay!

**Remember to change the admin password before going live!**
