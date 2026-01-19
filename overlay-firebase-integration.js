// Firebase Story Integration for Million Words Challenge Overlay
// Add this to your index.html:
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
// <script src="firebase-config.js"></script>
// <script src="overlay-firebase-integration.js"></script>

(function() {
  const db = firebase.firestore();
  let approvedStories = [];
  let currentStoryIndex = 0;
  let storyDisplayInterval = null;
  
  console.log('📚 Firebase story integration loading...');
  
  // Fetch approved stories from Firebase
  async function fetchApprovedStories() {
    try {
      const snapshot = await db.collection('stories')
        .where('status', '==', 'approved')
        .where('wordCount', '>=', 50)
        .orderBy('wordCount')
        .orderBy('approvedAt', 'desc')
        .get();
      
      approvedStories = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        approvedStories.push({
          id: doc.id,
          username: data.username,
          title: data.title,
          genre: data.genre || '',
          story: data.story,
          wordCount: data.wordCount,
          approvedAt: data.approvedAt
        });
      });
      
      console.log(`✅ Loaded ${approvedStories.length} approved stories from Firebase`);
      
      if (approvedStories.length > 0 && !storyDisplayInterval) {
        startStoryRotation();
      }
      
    } catch (error) {
      console.error('Error fetching approved stories:', error);
    }
  }
  
  // Start displaying stories in rotation
  function startStoryRotation() {
    if (approvedStories.length === 0) return;
    
    // Display first story immediately
    displayCurrentStory();
    
    // Calculate interval based on number of stories
    const interval = calculateDisplayInterval();
    
    // Set up rotation
    storyDisplayInterval = setInterval(() => {
      currentStoryIndex = (currentStoryIndex + 1) % approvedStories.length;
      displayCurrentStory();
    }, interval);
    
    console.log(`🔄 Story rotation started (every ${interval / 1000 / 60} minutes)`);
  }
  
  // Display the current story
  function displayCurrentStory() {
    if (approvedStories.length === 0) return;
    
    const story = approvedStories[currentStoryIndex];
    
    // Check if the overlay has story display functions
    if (typeof window.showStoryTicker === 'function') {
      window.showStoryTicker(story);
    } else if (typeof window.displayStory === 'function') {
      window.displayStory(story);
    } else {
      // Fallback: create a custom story display
      showStoryInOverlay(story);
    }
  }
  
  // Fallback function to display story (if overlay doesn't have built-in function)
  function showStoryInOverlay(story) {
    // Check if story overlay element exists
    let storyOverlay = document.getElementById('firebase-story-overlay');
    
    if (!storyOverlay) {
      // Create story overlay element
      storyOverlay = document.createElement('div');
      storyOverlay.id = 'firebase-story-overlay';
      storyOverlay.style.cssText = `
        position: fixed;
        bottom: 60px;
        left: 0;
        right: 0;
        background: rgba(233, 69, 96, 0.9);
        color: #fff;
        padding: 15px 20px;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 1s ease-out;
      `;
      document.body.appendChild(storyOverlay);
      
      // Add animation style
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Format story text (truncate if too long)
    const storyText = story.story.length > 200 
      ? story.story.substring(0, 200) + '...' 
      : story.story;
    
    storyOverlay.innerHTML = `
      <strong>📖 ${escapeHtml(story.title)}</strong> by ${escapeHtml(story.username)} 
      ${story.genre ? `(${escapeHtml(story.genre)})` : ''} - 
      ${escapeHtml(storyText)}
    `;
    
    // Hide after 30 seconds
    setTimeout(() => {
      storyOverlay.style.opacity = '0';
      storyOverlay.style.transition = 'opacity 1s';
    }, 30000);
    
    // Reset opacity for next story
    setTimeout(() => {
      storyOverlay.style.opacity = '1';
      storyOverlay.style.transition = 'none';
    }, 31000);
  }
  
  // Calculate display interval based on story queue
  function calculateDisplayInterval() {
    const baseInterval = 3 * 60 * 1000; // 3 minutes
    const minInterval = 2 * 60 * 1000; // 2 minutes
    const maxInterval = 5 * 60 * 1000; // 5 minutes
    
    if (approvedStories.length === 0) return maxInterval;
    if (approvedStories.length < 5) return maxInterval;
    if (approvedStories.length < 20) return baseInterval;
    return minInterval;
  }
  
  // Listen for real-time updates
  function setupRealtimeListener() {
    db.collection('stories')
      .where('status', '==', 'approved')
      .where('wordCount', '>=', 50)
      .onSnapshot(snapshot => {
        console.log('🔔 Story collection updated');
        fetchApprovedStories();
      }, error => {
        console.error('Error in real-time listener:', error);
      });
  }
  
  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Initialize
  function init() {
    fetchApprovedStories();
    setupRealtimeListener();
    
    // Refresh periodically as backup (in case listener fails)
    setInterval(fetchApprovedStories, 10 * 60 * 1000); // Every 10 minutes
  }
  
  // Wait for Firebase to be ready
  if (window.firebaseApp && window.firebaseApp.db) {
    init();
  } else {
    console.warn('Firebase not initialized. Make sure firebase-config.js is loaded first.');
  }
  
  // Expose API for manual control
  window.firebaseStories = {
    refresh: fetchApprovedStories,
    getCount: () => approvedStories.length,
    next: () => {
      currentStoryIndex = (currentStoryIndex + 1) % approvedStories.length;
      displayCurrentStory();
    },
    previous: () => {
      currentStoryIndex = (currentStoryIndex - 1 + approvedStories.length) % approvedStories.length;
      displayCurrentStory();
    },
    pause: () => {
      if (storyDisplayInterval) {
        clearInterval(storyDisplayInterval);
        storyDisplayInterval = null;
        console.log('⏸️ Story rotation paused');
      }
    },
    resume: () => {
      if (!storyDisplayInterval && approvedStories.length > 0) {
        startStoryRotation();
      }
    }
  };
  
  console.log('✅ Firebase story integration ready!');
  console.log('   Use window.firebaseStories.* for manual control');
  
})();
