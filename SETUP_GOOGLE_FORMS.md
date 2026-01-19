# Million Words Challenge - Google Forms Setup (No Backend Needed!)

## 🎯 Perfect for GitHub Pages!

This solution uses:
- **Google Forms** - For story submissions
- **Google Sheets** - For storage and moderation
- **GitHub Pages** - For hosting (static files only)
- **No backend server needed!**

---

## 📋 Step-by-Step Setup

### Part 1: Create Google Form

1. **Go to Google Forms**: https://forms.google.com/
2. Click **"+ Blank"** to create a new form
3. **Name your form**: "Million Words Challenge - Story Submission"

4. **Add these questions**:

   **Question 1: Twitch Username**
   - Type: Short answer
   - Required: Yes
   
   **Question 2: Story Title**
   - Type: Short answer
   - Required: Yes
   
   **Question 3: Genre (Optional)**
   - Type: Dropdown
   - Options: Fantasy, Science Fiction, Mystery, Romance, Horror (PG), Adventure, Comedy, Drama, Slice of Life, Other
   - Required: No
   
   **Question 4: Your Story**
   - Type: Paragraph
   - Required: Yes
   - Description: "Minimum 50 words. Keep it family-friendly (PG)!"

5. **Customize the form**:
   - Click the palette icon (🎨) at the top
   - Choose a theme color (use #e94560 for your brand color)
   - Add a header image if you want

6. **Add confirmation message**:
   - Click Settings (⚙️)
   - Go to "Presentation" tab
   - Confirmation message: "✅ Story submitted! We'll review it and it will appear on stream soon. Thanks for participating!"

7. **Get the form link**:
   - Click **"Send"** button
   - Click the link icon (🔗)
   - Check "Shorten URL"
   - Copy the link (e.g., `https://forms.gle/xxxxx`)

8. **Get the embed code**:
   - In the "Send" dialog, click the `< >` (embed) icon
   - Copy the iframe code
   - Save this for later

---

### Part 2: Set Up Google Sheets

1. **Link to Sheets**:
   - In your Google Form, click "Responses" tab
   - Click the green Sheets icon
   - Create a new spreadsheet: "Story Submissions"

2. **Your sheet now has columns**:
   - Timestamp
   - Twitch Username
   - Story Title
   - Genre
   - Your Story

3. **Add moderation columns**:
   - Click on column F header, add: **Status** (dropdown: Pending, Approved, Rejected)
   - Click on column G header, add: **Word Count**
   - Click on column H header, add: **Approved Date**
   - Click on column I header, add: **Notes**

4. **Add word count formula**:
   - In cell G2, paste this formula:
   ```
   =IF(E2="","",LEN(TRIM(E2))-LEN(SUBSTITUTE(E2," ",""))+1)
   ```
   - Drag the formula down for all rows

5. **Set up data validation for Status**:
   - Select column F (Status)
   - Data → Data validation
   - Criteria: List of items: `Pending,Approved,Rejected`
   - Click Save

6. **Color code statuses** (optional):
   - Select Status column
   - Format → Conditional formatting
   - Format rules:
     - If "Approved" → Green background
     - If "Rejected" → Red background
     - If "Pending" → Yellow background

---

### Part 3: Publish Approved Stories

**Option A: Manual JSON Export (Simplest)**

1. Create a new sheet tab called "Approved Stories"
2. Use this formula in A2:
```
=FILTER(Responses!A:H, Responses!F:F="Approved", Responses!G:G>=50)
```

3. **Export to JSON manually**:
   - When you want to update, go to File → Download → Comma-separated values
   - Use a CSV to JSON converter online
   - Upload the JSON file to your GitHub Pages repo as `stories.json`

**Option B: Google Apps Script (Automated)**

1. In Google Sheets, go to Extensions → Apps Script
2. Delete any default code
3. Paste this script:

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Responses');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indices
  const usernameCol = headers.indexOf('Twitch Username');
  const titleCol = headers.indexOf('Story Title');
  const genreCol = headers.indexOf('Genre');
  const storyCol = headers.indexOf('Your Story');
  const statusCol = headers.indexOf('Status');
  const wordCountCol = headers.indexOf('Word Count');
  const approvedDateCol = headers.indexOf('Approved Date');
  
  const stories = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Only include approved stories with 50+ words
    if (row[statusCol] === 'Approved' && row[wordCountCol] >= 50) {
      stories.push({
        username: row[usernameCol],
        title: row[titleCol],
        genre: row[genreCol] || '',
        story: row[storyCol],
        wordCount: row[wordCountCol],
        approvedDate: row[approvedDateCol]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(stories))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click "Deploy" → "New deployment"
5. Type: Web app
6. Execute as: Me
7. Who has access: Anyone
8. Click "Deploy"
9. Copy the web app URL (e.g., `https://script.google.com/macros/s/xxxxx/exec`)

---

### Part 4: Update Your Website

**Update submit.html**:

Replace the form section with your Google Form embed:

```html
<!-- Replace the entire form in submit.html with: -->
<div style="width: 100%; height: 800px;">
  <iframe src="YOUR_GOOGLE_FORM_EMBED_URL" 
          width="100%" 
          height="100%" 
          frameborder="0" 
          marginheight="0" 
          marginwidth="0">
    Loading…
  </iframe>
</div>

<a href="index.html" class="back-link">← Back to Overlay</a>
```

---

### Part 5: Moderate Stories

**Your Workflow**:

1. Open your Google Sheet
2. See new submissions in real-time
3. Review each story:
   - Check word count (column G - must be 50+)
   - Read the content
   - Set Status to "Approved" or "Rejected"
   - Add approved date if approving
4. Approved stories automatically appear in your overlay!

**To Ban Users**:
- Create a new sheet tab called "Banned Users"
- List usernames (one per row)
- You'll need to manually check against this list

---

## 🎨 Alternative: Google Form in Styled Page

Keep your custom styled submit.html and just link to the Google Form:

```html
<a href="YOUR_GOOGLE_FORM_URL" target="_blank" class="submit-btn">
  Submit Story via Google Forms
</a>
```

---

## 📊 Display Stories on Overlay

Update your `index.html` to fetch from Google Sheets:

```html
<script>
// Add this to your index.html
const GOOGLE_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';

async function loadApprovedStories() {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const stories = await response.json();
    
    console.log(`Loaded ${stories.length} approved stories`);
    
    // Integrate with your existing story display system
    // The stories array has: username, title, genre, story, wordCount, approvedDate
    
  } catch (error) {
    console.error('Error loading stories:', error);
  }
}

// Load stories when overlay starts
loadApprovedStories();

// Refresh every 5 minutes
setInterval(loadApprovedStories, 5 * 60 * 1000);
</script>
```

---

## ✅ Advantages of This Approach

- ✅ **No backend needed** - Perfect for GitHub Pages
- ✅ **Free forever** - Google Forms/Sheets are free
- ✅ **Easy moderation** - Just use Google Sheets interface
- ✅ **Real-time updates** - See submissions instantly
- ✅ **Shareable** - Easy link for Twitch chat
- ✅ **Mobile friendly** - Google Forms work great on phones
- ✅ **Built-in spam protection** - Google's reCAPTCHA

---

## 🔒 Content Moderation

Since you manually approve each story:
- You control what appears on stream
- Review each submission before approval
- Reject inappropriate content easily
- No automated filtering needed

---

## 📱 Share with Your Community

**In Twitch Chat**:
```
📝 Submit your story! https://forms.gle/xxxxx (Minimum 50 words, PG content only)
```

**On Your Stream Overlay**:
Add a text box with the link or QR code

---

## 🆘 Troubleshooting

**CORS Issues with Apps Script**:
- Make sure "Who has access" is set to "Anyone"
- Redeploy if you make changes

**Stories Not Loading**:
- Check browser console (F12)
- Verify the Apps Script URL is correct
- Test the URL directly in browser

**Too Many Submissions**:
- Forms have no limit
- Sheets can handle 10 million cells
- You're good to go!

---

## 🎉 You're Done!

This is much simpler than running a backend:
1. Create Google Form (5 minutes)
2. Set up Sheet columns (2 minutes)
3. Deploy Apps Script (3 minutes)
4. Update your website (5 minutes)

**Total setup time: ~15 minutes!**
