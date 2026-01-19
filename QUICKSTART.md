# Million Words Challenge - Story Submission Quick Start

## ✅ Perfect for GitHub Pages!

Your story submission system now uses **Google Forms + Google Sheets** - no backend needed!

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Google Form
1. Go to https://forms.google.com/
2. Click "+ Blank" to create new form
3. Add these fields:
   - **Twitch Username** (Short answer, Required)
   - **Story Title** (Short answer, Required)
   - **Genre** (Dropdown, Optional): Fantasy, Sci-Fi, Mystery, Romance, Horror (PG), Adventure, Comedy, Drama, Slice of Life, Other
   - **Your Story** (Paragraph, Required) - Add description: "Minimum 50 words, PG only!"

4. Customize theme (Settings → Presentation)
5. Click **Send** → Get the **embed code** (< > icon)

### Step 2: Link to Google Sheets
1. In form, click **Responses** tab
2. Click green Sheets icon → Create new spreadsheet
3. Add these columns to your sheet:
   - Column F: **Status** (Pending/Approved/Rejected)
   - Column G: **Word Count** - Add formula in G2: `=IF(E2="","",LEN(TRIM(E2))-LEN(SUBSTITUTE(E2," ",""))+1)`
   - Column H: **Approved Date**
   - Column I: **Notes**

### Step 3: Update Your Website
1. Open `submit.html`
2. Find line with `YOUR_GOOGLE_FORM_EMBED_URL`
3. Replace with your form's embed URL
4. Save and commit to GitHub

### Step 4: Set Up Apps Script (For Overlay Integration)
1. In Google Sheets: Extensions → Apps Script
2. Paste the script from `SETUP_GOOGLE_FORMS.md` (Part 3)
3. Deploy as Web App
4. Copy the deployment URL
5. Add to your `index.html` to fetch approved stories

### Step 5: Update Admin Panel
1. Open `admin.html`
2. Replace `YOUR_GOOGLE_SHEET_URL` with your sheet's URL
3. Save and commit

---

## 📊 Daily Workflow

### For Moderators:
1. Open your Google Sheet
2. Review new submissions (Status = "Pending")
3. Check word count (must be 50+)
4. Read content, verify it's PG-friendly
5. Set Status to "Approved" or "Rejected"
6. If approved, add today's date in Approved Date column
7. Approved stories automatically appear on overlay!

### For Users:
Share this link in Twitch chat:
`https://millionwordschallengeoverlay.kodair.us/submit.html`

---

## 🎯 What You Get

✅ **submit.html** - Embeds your Google Form with styled page
✅ **admin.html** - Instructions for moderating in Google Sheets
✅ **SETUP_GOOGLE_FORMS.md** - Detailed setup guide
✅ **No backend needed** - Everything runs on Google's infrastructure
✅ **Free forever** - No hosting costs
✅ **Real-time updates** - See submissions instantly

---

## 🔗 Important URLs

- **Submission Page**: https://millionwordschallengeoverlay.kodair.us/submit.html
- **Admin Panel**: https://millionwordschallengeoverlay.kodair.us/admin.html
- **Main Overlay**: https://millionwordschallengeoverlay.kodair.us/

---

## 📝 Files in This Repo

**Active Files:**
- `submit.html` - Story submission page (embeds Google Form)
- `admin.html` - Admin panel guide
- `SETUP_GOOGLE_FORMS.md` - Detailed setup instructions
- `QUICKSTART.md` - This file

**Backup Files (ignore these):**
- `submit_original.html` - Original complex form (backup)
- `admin_original.html` - Original admin panel (backup)

---

## 🆘 Need Help?

1. Read `SETUP_GOOGLE_FORMS.md` for detailed instructions
2. Test your Google Form directly first
3. Make sure sheet has Status, Word Count, Approved Date columns
4. Check that Apps Script is deployed as "Anyone" can access

---

## 🎉 That's It!

You now have a fully functional story submission system that:
- Works perfectly with GitHub Pages
- Costs $0 to run
- Is easy to moderate
- Scales to millions of submissions

**Now go create that Google Form and start accepting stories!** 📚
