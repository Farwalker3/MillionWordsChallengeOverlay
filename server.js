// Simple Node.js/Express backend for Million Words Challenge story submissions
// This can be deployed to Vercel, Netlify, Railway, or any Node.js hosting

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STORIES_FILE = path.join(DATA_DIR, 'stories.json');
const BANNED_USERS_FILE = path.join(DATA_DIR, 'banned-users.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files (HTML, CSS, JS)

// Enhanced content filtering
const BANNED_WORDS = [
  'fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'cock', 'dick', 
  'pussy', 'cunt', 'bastard', 'whore', 'slut', 'nigger', 'fag',
  'rape', 'molest', 'porn', 'sex', 'xxx'
];

const VIOLENCE_KEYWORDS = [
  'kill', 'murder', 'blood', 'gore', 'torture', 'suicide', 'death',
  'weapon', 'gun', 'knife', 'violence'
];

// Initialize data directory and files
async function initializeData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize stories file
    try {
      await fs.access(STORIES_FILE);
    } catch {
      await fs.writeFile(STORIES_FILE, JSON.stringify([]));
    }
    
    // Initialize banned users file
    try {
      await fs.access(BANNED_USERS_FILE);
    } catch {
      await fs.writeFile(BANNED_USERS_FILE, JSON.stringify([]));
    }
    
    console.log('✅ Data directory initialized');
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Helper functions
async function readStories() {
  try {
    const data = await fs.readFile(STORIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeStories(stories) {
  await fs.writeFile(STORIES_FILE, JSON.stringify(stories, null, 2));
}

async function readBannedUsers() {
  try {
    const data = await fs.readFile(BANNED_USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeBannedUsers(users) {
  await fs.writeFile(BANNED_USERS_FILE, JSON.stringify(users, null, 2));
}

// Content filtering function
function checkContent(text) {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  // Check for banned words
  const foundBanned = BANNED_WORDS.some(word => lowerText.includes(word));
  if (foundBanned) {
    return { passed: false, reason: 'Contains inappropriate language' };
  }
  
  // Check for excessive violence keywords
  const violenceCount = VIOLENCE_KEYWORDS.filter(word => lowerText.includes(word)).length;
  if (violenceCount > 2) {
    return { passed: false, reason: 'Contains excessive violent content' };
  }
  
  // Check for excessive caps (yelling)
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
  if (letterCount > 50 && capsCount / letterCount > 0.5) {
    return { passed: false, reason: 'Excessive use of capital letters' };
  }
  
  // Check for spam patterns
  const uniqueWords = new Set(words);
  if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
    return { passed: false, reason: 'Appears to be spam or repetitive content' };
  }
  
  return { passed: true };
}

// Calculate story expiration time
function calculateMaxAge(approvedCount) {
  const baseDays = 2;
  const minHours = 6;
  
  if (approvedCount < 10) return baseDays * 24 * 60 * 60 * 1000; // 2 days
  if (approvedCount < 50) return 24 * 60 * 60 * 1000; // 1 day
  if (approvedCount < 100) return 12 * 60 * 60 * 1000; // 12 hours
  return minHours * 60 * 60 * 1000; // 6 hours minimum
}

// API Routes

// Submit a story
app.post('/api/submit-story', async (req, res) => {
  try {
    const { username, title, genre, story, wordCount } = req.body;
    
    // Validation
    if (!username || !title || !story) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (wordCount < 50) {
      return res.status(400).json({ error: 'Story must be at least 50 words' });
    }
    
    // Check if user is banned
    const bannedUsers = await readBannedUsers();
    if (bannedUsers.includes(username.toLowerCase())) {
      return res.status(403).json({ error: 'User is banned from submitting stories' });
    }
    
    // Content filtering
    const titleCheck = checkContent(title);
    if (!titleCheck.passed) {
      return res.status(400).json({ error: `Title: ${titleCheck.reason}` });
    }
    
    const storyCheck = checkContent(story);
    if (!storyCheck.passed) {
      return res.status(400).json({ error: `Story: ${storyCheck.reason}` });
    }
    
    // Create story object
    const newStory = {
      id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: username.trim(),
      title: title.trim(),
      genre: genre || '',
      story: story.trim(),
      wordCount,
      timestamp: new Date().toISOString(),
      status: 'pending', // pending, approved, rejected
      approvedAt: null
    };
    
    // Save story
    const stories = await readStories();
    stories.push(newStory);
    await writeStories(stories);
    
    console.log(`✅ New story submitted by ${username}: "${title}"`);
    
    res.status(201).json({ 
      success: true, 
      message: 'Story submitted successfully',
      storyId: newStory.id
    });
    
  } catch (error) {
    console.error('Error submitting story:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all stories (admin only - add authentication in production)
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await readStories();
    res.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get approved stories for overlay
app.get('/api/stories/approved', async (req, res) => {
  try {
    const stories = await readStories();
    const approvedStories = stories.filter(s => s.status === 'approved');
    
    // Filter out expired stories
    const maxAge = calculateMaxAge(approvedStories.length);
    const now = Date.now();
    
    const activeStories = approvedStories.filter(story => {
      if (!story.approvedAt) return false;
      const age = now - new Date(story.approvedAt).getTime();
      return age <= maxAge;
    });
    
    res.json(activeStories);
  } catch (error) {
    console.error('Error fetching approved stories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve a story (admin only)
app.post('/api/stories/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const stories = await readStories();
    const story = stories.find(s => s.id === id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    story.status = 'approved';
    story.approvedAt = new Date().toISOString();
    
    await writeStories(stories);
    
    console.log(`✅ Story approved: "${story.title}" by ${story.username}`);
    
    res.json({ success: true, story });
  } catch (error) {
    console.error('Error approving story:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject a story (admin only)
app.post('/api/stories/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const stories = await readStories();
    const story = stories.find(s => s.id === id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    story.status = 'rejected';
    
    await writeStories(stories);
    
    console.log(`❌ Story rejected: "${story.title}" by ${story.username}`);
    
    res.json({ success: true, story });
  } catch (error) {
    console.error('Error rejecting story:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a story (admin only)
app.delete('/api/stories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let stories = await readStories();
    const originalLength = stories.length;
    
    stories = stories.filter(s => s.id !== id);
    
    if (stories.length === originalLength) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    await writeStories(stories);
    
    console.log(`🗑️ Story deleted: ${id}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ban a user (admin only)
app.post('/api/users/:username/ban', async (req, res) => {
  try {
    const { username } = req.params;
    const bannedUsers = await readBannedUsers();
    
    if (!bannedUsers.includes(username.toLowerCase())) {
      bannedUsers.push(username.toLowerCase());
      await writeBannedUsers(bannedUsers);
    }
    
    // Reject all stories by this user
    const stories = await readStories();
    stories.forEach(story => {
      if (story.username.toLowerCase() === username.toLowerCase()) {
        story.status = 'rejected';
      }
    });
    await writeStories(stories);
    
    console.log(`🚫 User banned: ${username}`);
    
    res.json({ success: true, bannedUser: username });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get banned users list (admin only)
app.get('/api/users/banned', async (req, res) => {
  try {
    const bannedUsers = await readBannedUsers();
    res.json(bannedUsers);
  } catch (error) {
    console.error('Error fetching banned users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  await initializeData();
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Million Words Challenge Backend`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`📝 Story submission: http://localhost:${PORT}/submit.html`);
    console.log(`⚙️  Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`\n💡 Note: Change the admin password in admin.html before deploying!\n`);
  });
}

start();
