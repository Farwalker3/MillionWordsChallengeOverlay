# Million Words Challenge - Firebase Setup Guide

## 🔥 Why Firebase?

Firebase is perfect for GitHub Pages because:
- ✅ **Real-time database** - Stories update instantly
- ✅ **Built-in authentication** - Secure admin access
- ✅ **Free tier** - 1GB storage, 10GB/month bandwidth
- ✅ **No server management** - All handled by Google
- ✅ **Works with static sites** - Perfect for GitHub Pages

---

## 🚀 Quick Setup (20 minutes)

### Part 1: Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name: `million-words-challenge`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

---

### Part 2: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in left menu
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add rules later)
4. Select your region (choose closest to your audience)
5. Click **"Enable"**

---

### Part 3: Enable Authentication

1. Click **"Authentication"** in left menu
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Click **"Save"**

---

### Part 4: Create Admin User

1. In Authentication section, click **"Users"** tab
2. Click **"Add user"**
3. Enter your admin email and password
4. Click **"Add user"**
5. Copy the User UID (you'll need this for security rules)

---

### Part 5: Get Firebase Config

1. Click the gear icon (⚙️) next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to "Your apps"
4. Click the **web icon** (</>) to add a web app
5. Register app name: `million-words-overlay`
6. Check **"Firebase Hosting"** (optional)
7. Click **"Register app"**
8. Copy the Firebase configuration object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

9. Save this config - you'll add it to your HTML files

---

### Part 6: Set Up Security Rules

1. In Firestore Database, click **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public can read approved stories
    match /stories/{storyId} {
      allow read: if resource.data.status == 'approved';
      allow create: if request.auth == null 
                    && request.resource.data.status == 'pending'
                    && request.resource.data.wordCount >= 50;
      allow update, delete: if request.auth != null 
                            && request.auth.uid == 'YOUR_ADMIN_UID_HERE';
    }
    
    // Banned users list (admin only)
    match /bannedUsers/{userId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == 'YOUR_ADMIN_UID_HERE';
    }
    
    // Everything else denied
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Replace `YOUR_ADMIN_UID_HERE` with your admin User UID from Part 4
4. Click **"Publish"**

---

### Part 7: Create Firestore Indexes (Optional)

For better performance:

1. In Firestore Database, click **"Indexes"** tab
2. Click **"Create index"**
3. Collection ID: `stories`
4. Add fields:
   - `status` (Ascending)
   - `approvedAt` (Descending)
5. Click **"Create index"** (takes a few minutes)

---

### Part 8: Update Your Website Files

1. Open `firebase-config.js` in your project
2. Paste your Firebase config from Part 5
3. Update `submit.html`, `admin.html`, and your overlay files
4. Commit and push to GitHub

---

## 🗂️ Firebase Data Structure

### Stories Collection (`/stories`)

Each story document has:
```javascript
{
  id: "auto-generated-id",
  username: "farwalker3",
  title: "My Story Title",
  genre: "fantasy",
  story: "Once upon a time...",
  wordCount: 150,
  status: "pending", // pending, approved, rejected
  submittedAt: Timestamp,
  approvedAt: Timestamp (or null),
  moderatedBy: "admin-uid" (or null)
}
```

### Banned Users Collection (`/bannedUsers`)

Each document:
```javascript
{
  username: "baduser123",
  bannedAt: Timestamp,
  reason: "Inappropriate content"
}
```

---

## 💰 Firebase Free Tier Limits

**Firestore:**
- 1 GB storage
- 50K reads/day
- 20K writes/day
- 20K deletes/day

**Authentication:**
- Unlimited users

**Bandwidth:**
- 10 GB/month

**Cost if you exceed:**
- $0.18 per GB storage
- $0.06 per 100K reads
- This should handle thousands of submissions!

---

## 🔒 Security Best Practices

1. ✅ Never expose admin credentials in client-side code
2. ✅ Use Firebase Security Rules (already configured above)
3. ✅ Enable App Check for production (prevents abuse)
4. ✅ Set up reCAPTCHA for submission form
5. ✅ Monitor usage in Firebase Console

---

## 📊 Monitor Your Usage

1. Go to Firebase Console
2. Click "Usage and billing"
3. See real-time usage stats
4. Set up budget alerts if needed

---

## 🔄 Backup Your Data

Firebase doesn't auto-backup on free tier:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Export data: `firebase firestore:export backup/`
4. Schedule regular exports

Or use the Firebase Console:
- Cloud Firestore → Export/Import

---

## 🆘 Troubleshooting

**"Permission denied" errors:**
- Check Security Rules are published
- Verify admin UID is correct
- Make sure you're logged in as admin

**Stories not appearing:**
- Check status is set to "approved"
- Verify wordCount >= 50
- Check browser console for errors

**Submission form not working:**
- Verify Firebase config is correct
- Check firebaseConfig object has all fields
- Test with browser console open

---

## 🎉 You're Ready!

Firebase setup complete! Now your story submission system has:
- Real-time database
- Secure authentication
- Automatic content validation
- Live updates on overlay
- Free hosting for your data

**Next step:** Update your HTML files with Firebase integration!
