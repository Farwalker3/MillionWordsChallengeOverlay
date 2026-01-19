# Million Words Challenge - Firebase Quick Start

## 🔥 Firebase Setup (20 minutes)

### Step 1: Create Firebase Project (5 min)
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name: `million-words-challenge`
4. Click "Create project"

### Step 2: Enable Firestore (3 min)
1. Click "Firestore Database" → "Create database"
2. Choose "Start in production mode"
3. Select your region
4. Click "Enable"

### Step 3: Enable Authentication (2 min)
1. Click "Authentication" → "Get started"
2. Go to "Sign-in method" tab
3. Enable "Email/Password"
4. Click "Save"

### Step 4: Create Admin User (2 min)
1. In Authentication, click "Users" tab
2. Click "Add user"
3. Enter your admin email & password
4. **Copy the User UID** (you'll need this!)

### Step 5: Get Firebase Config (3 min)
1. Click gear icon → "Project settings"
2. Scroll to "Your apps"
3. Click web icon (</>) → Register app
4. Copy the firebaseConfig object
5. Paste it in `firebase-config.js` (replace the placeholder)

### Step 6: Set Security Rules (3 min)
1. In Firestore, click "Rules" tab
2. Replace with rules from `SETUP_FIREBASE.md` (Part 6)
3. **Replace `YOUR_ADMIN_UID_HERE` with your actual admin UID**
4. Click "Publish"

### Step 7: Add to Your Overlay (2 min)
Add these lines to your `index.html` before closing `</body>` tag:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

<!-- Your Firebase Config -->
<script src="firebase-config.js"></script>

<!-- Story Integration -->
<script src="overlay-firebase-integration.js"></script>
```

---

## 🚀 Using Your System

### For Users:
- Submit stories at: `https://millionwordschallengeoverlay.kodair.us/submit.html`
- Stories are auto-filtered for PG content
- Minimum 50 words required

### For You (Admin):
1. Go to: `https://millionwordschallengeoverlay.kodair.us/admin.html`
2. Login with your admin email/password
3. Review pending stories
4. Click "Approve" or "Reject"
5. Approved stories appear on stream automatically!

---

## ✨ Features

✅ **Real-time updates** - Stories appear instantly when approved
✅ **Auto content filtering** - Blocks profanity, spam, excessive caps
✅ **User banning** - Ban users and reject all their stories
✅ **Story rotation** - Shows stories in rotation (2-5 min intervals)
✅ **Firebase free tier** - Handles thousands of submissions
✅ **No backend needed** - Works perfectly with GitHub Pages

---

## 📊 Firebase Free Tier

- ✅ 1 GB storage
- ✅ 50K reads/day
- ✅ 20K writes/day
- ✅ Unlimited authentication
- ✅ 10 GB bandwidth/month

**Perfect for your challenge!** Should handle 1000+ submissions easily.

---

## 🎮 Manual Controls

Open browser console (F12) and use:

```javascript
// Check story count
firebaseStories.getCount()

// Manually show next story
firebaseStories.next()

// Show previous story
firebaseStories.previous()

// Pause rotation
firebaseStories.pause()

// Resume rotation
firebaseStories.resume()

// Refresh story list
firebaseStories.refresh()
```

---

## 🔒 Security

✅ Security rules protect your data
✅ Only admins can approve/reject stories
✅ Public can only submit (status: pending) and read approved
✅ User banning prevents repeat offenders
✅ Content filtering blocks inappropriate content

---

## 📁 Files Created

**Active Files:**
- `firebase-config.js` - Your Firebase configuration
- `submit.html` - Story submission form
- `admin.html` - Admin moderation panel
- `overlay-firebase-integration.js` - Integrates stories with overlay
- `SETUP_FIREBASE.md` - Detailed setup guide
- `QUICKSTART_FIREBASE.md` - This file

**Backup Files (ignore):**
- `submit_google_forms.html` - Old Google Forms version
- `admin_google_sheets.html` - Old Google Sheets version
- `submit_original.html` - Original complex form

---

## 🆘 Troubleshooting

**"Permission denied" error:**
- Check Firebase Security Rules are published
- Verify your admin UID is correct in the rules
- Make sure you're logged in as admin

**Stories not appearing:**
- Check Firebase Console → Firestore Database
- Verify status is "approved" and wordCount >= 50
- Check browser console for errors

**Can't login to admin panel:**
- Verify you created admin user in Authentication
- Check email/password are correct
- Check browser console for errors

---

## 💰 Cost

**FREE for your usage!** Firebase free tier includes:
- 50,000 document reads per day
- 20,000 document writes per day
- 1 GB storage

Even with heavy usage, you'll stay well within limits.

---

## 🎉 You're Done!

Your Firebase-powered story system is ready:
1. Users submit stories → Filtered automatically
2. You review in admin panel → Approve/Reject
3. Approved stories → Appear on stream in real-time
4. Stories rotate every 2-5 minutes

**Total cost: $0**
**Total setup time: ~20 minutes**

Now go share that submit link with your Twitch community! 🎮📝
