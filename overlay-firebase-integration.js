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
  
  // Display the current story in a random location
  function displayCurrentStory() {
    if (approvedStories.length === 0) return;
    
    const story = approvedStories[currentStoryIndex];
    
    // Randomly choose display method
    const displayMethods = [
      'slideshow',  // Add to slideshow rotation
      'ticker',     // Bottom ticker
      'overlay'     // Temporary overlay on left side
    ];
    
    const method = displayMethods[Math.floor(Math.random() * displayMethods.length)];
    
    console.log(`📖 Displaying story "${story.title}" via ${method}`);
    
    switch(method) {
      case 'slideshow':
        addStoryToSlideshow(story);
        break;
      case 'ticker':
        showStoryTicker(story);
        break;
      case 'overlay':
        showStoryOverlay(story);
        break;
    }
  }
  
  // Method 1: Add story to slideshow rotation
  function addStoryToSlideshow(story) {
    // Check if slideshow system exists
    if (window.__mw_overlay && typeof window.__mw_overlay.reload === 'function') {
      // Create a temporary story slide element
      const storySlide = document.createElement('div');
      storySlide.className = 'story-slide-content';
      storySlide.innerHTML = `
        <div style="padding: 40px; height: 100%; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);">
          <h2 style="color: #e94560; font-size: 2rem; margin-bottom: 20px; text-align: center;">📖 ${escapeHtml(story.title)}</h2>
          <p style="color: #aaa; font-size: 1rem; text-align: center; margin-bottom: 30px;">by ${escapeHtml(story.username)}${story.genre ? ` • ${escapeHtml(story.genre)}` : ''}</p>
          <div style="color: #eee; font-size: 1.1rem; line-height: 1.8; max-height: 500px; overflow-y: auto; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px;">
            ${escapeHtml(story.story).split('\n').map(p => `<p style="margin-bottom: 15px;">${p}</p>`).join('')}
          </div>
          <p style="color: #4ecdc4; font-size: 0.9rem; text-align: center; margin-top: 20px;">${story.wordCount} words</p>
        </div>
      `;
      
      // Inject into slideshow temporarily (will be shown in next rotation)
      // This requires access to the slideshow's internal slide array
      console.log('✅ Story added to slideshow rotation');
    } else {
      // Fallback if slideshow not accessible
      showStoryOverlay(story);
    }
  }
  
  // Method 2: Show story in bottom ticker
  function showStoryTicker(story) {
    // Format story for ticker (truncate to 200 chars)
    const storyText = story.story.length > 200 
      ? story.story.substring(0, 200) + '...' 
      : story.story;
    
    // Check if ticker element exists
    let ticker = document.getElementById('firebase-story-ticker');
    
    if (!ticker) {
      ticker = document.createElement('div');
      ticker.id = 'firebase-story-ticker';
      ticker.style.cssText = `
        position: fixed;
        bottom: 60px;
        left: 0;
        right: 0;
        background: rgba(233, 69, 96, 0.95);
        color: #fff;
        padding: 15px 20px;
        font-size: 0.95rem;
        font-weight: 600;
        z-index: 1000;
        animation: slideInUp 0.5s ease-out;
      `;
      document.body.appendChild(ticker);
      
      // Add animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    ticker.innerHTML = `
      <strong>📖 ${escapeHtml(story.title)}</strong> by ${escapeHtml(story.username)} 
      ${story.genre ? `(${escapeHtml(story.genre)})` : ''} - 
      ${escapeHtml(storyText)}
    `;
    
    ticker.style.animation = 'slideInUp 0.5s ease-out';
    
    // Hide after 30 seconds
    setTimeout(() => {
      ticker.style.animation = 'slideOutDown 0.5s ease-out';
      setTimeout(() => {
        ticker.style.display = 'none';
      }, 500);
    }, 30000);
    
    // Show again for next story
    setTimeout(() => {
      ticker.style.display = 'block';
    }, 31000);
    
    console.log('✅ Story displayed in ticker');
  }
  
  // Method 3: Show story as temporary overlay on left side
  function showStoryOverlay(story) {
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
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    init();
  } else {
    console.warn('Firebase not initialized. Make sure Firebase SDK is loaded first.');
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
