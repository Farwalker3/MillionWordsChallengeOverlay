// Firebase Story Integration for Million Words Challenge Overlay
// Displays approved stories in random locations: slideshow, ticker, or overlay

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
      
      // Add story word counts to game state
      addStoryWordCounts();
      
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
    const displayMethods = ['ticker', 'overlay', 'slideshow'];
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
  
  // Method 1: Add story to slideshow rotation (right side)
  function addStoryToSlideshow(story) {
    const slideshow = document.getElementById('slideshow');
    
    if (!slideshow) {
      console.warn('Slideshow not found, falling back to ticker');
      showStoryTicker(story);
      return;
    }
    
    // Create story slide
    const storySlide = document.createElement('div');
    storySlide.className = 'story-slide';
    storySlide.style.cssText = `
      width: 100%;
      height: 100%;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
    `;
    
    storySlide.innerHTML = `
      <h2 style="color: #e94560; font-size: 2.5rem; margin-bottom: 20px; text-align: center; font-family: 'Pathway Extreme', Impact, sans-serif; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
        📖 ${escapeHtml(story.title)}
      </h2>
      <p style="color: #aaa; font-size: 1.2rem; text-align: center; margin-bottom: 30px;">
        by ${escapeHtml(story.username)}${story.genre ? ` • ${escapeHtml(story.genre)}` : ''}
      </p>
      <div style="color: #eee; font-size: 1.2rem; line-height: 1.8; max-height: 550px; overflow-y: auto; padding: 25px; background: rgba(0,0,0,0.4); border-radius: 12px; border: 2px solid #0f3460; margin-bottom: 20px;">
        ${escapeHtml(story.story).split('\n\n').map(p => p.trim()).filter(p => p).map(p => `<p style="margin-bottom: 20px;">${p}</p>`).join('')}
      </div>
      <p style="color: #4ecdc4; font-size: 1rem; text-align: center;">${story.wordCount} words</p>
    `;
    
    // Replace slideshow content temporarily
    const originalContent = slideshow.innerHTML;
    slideshow.innerHTML = '';
    slideshow.appendChild(storySlide);
    
    console.log('✅ Story displayed in slideshow');
    
    // Restore after 45 seconds
    setTimeout(() => {
      slideshow.innerHTML = originalContent;
    }, 45000);
  }
  
  // Method 2: Show story in bottom ticker
  function showStoryTicker(story) {
    // Format story for ticker (truncate to 250 chars)
    const storyText = story.story.length > 250 
      ? story.story.substring(0, 250) + '...' 
      : story.story;
    
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
        padding: 18px 25px;
        font-size: 1rem;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
        transform: translateY(0);
        transition: transform 0.5s ease-out;
      `;
      document.body.appendChild(ticker);
    }
    
    ticker.innerHTML = `
      <strong>📖 ${escapeHtml(story.title)}</strong> by ${escapeHtml(story.username)} 
      ${story.genre ? `(${escapeHtml(story.genre)})` : ''} - 
      ${escapeHtml(storyText)}
    `;
    
    ticker.style.transform = 'translateY(0)';
    
    console.log('✅ Story displayed in ticker');
    
    // Hide after 30 seconds
    setTimeout(() => {
      ticker.style.transform = 'translateY(150%)';
    }, 30000);
  }
  
  // Method 3: Show story as temporary overlay (replaces board game)
  function showStoryOverlay(story) {
    const gameBoard = document.getElementById('game-board');
    const leaderboard = document.getElementById('leaderboard');
    
    if (!gameBoard) {
      console.warn('Game board not found, falling back to ticker');
      showStoryTicker(story);
      return;
    }
    
    // Create story overlay
    const storyDisplay = document.createElement('div');
    storyDisplay.id = 'firebase-story-fullscreen';
    storyDisplay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
      padding: 35px;
      z-index: 100;
      display: flex;
      flex-direction: column;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.5s ease-out;
    `;
    
    storyDisplay.innerHTML = `
      <h2 style="color: #e94560; font-size: 2rem; margin-bottom: 20px; text-align: center; font-family: 'Pathway Extreme', Impact, sans-serif; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
        📖 ${escapeHtml(story.title)}
      </h2>
      <p style="color: #aaa; font-size: 1.1rem; text-align: center; margin-bottom: 30px;">
        by ${escapeHtml(story.username)}${story.genre ? ` • ${escapeHtml(story.genre)}` : ''} • ${story.wordCount} words
      </p>
      <div style="color: #eee; font-size: 1.1rem; line-height: 1.8; max-height: 450px; overflow-y: auto; padding: 25px; background: rgba(0,0,0,0.5); border-radius: 10px; border: 2px solid #0f3460; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        ${escapeHtml(story.story).split('\n\n').map(p => p.trim()).filter(p => p).map(p => `<p style="margin-bottom: 18px;">${p}</p>`).join('')}
      </div>
    `;
    
    // Hide board game and leaderboard
    gameBoard.style.display = 'none';
    if (leaderboard) leaderboard.style.display = 'none';
    
    // Insert story display
    gameBoard.parentElement.insertBefore(storyDisplay, gameBoard);
    
    // Fade in
    setTimeout(() => {
      storyDisplay.style.opacity = '1';
    }, 50);
    
    console.log('✅ Story displayed as overlay (replacing board game)');
    
    // Remove after 45 seconds and restore board game
    setTimeout(() => {
      storyDisplay.style.opacity = '0';
      setTimeout(() => {
        storyDisplay.remove();
        gameBoard.style.display = '';
        if (leaderboard) leaderboard.style.display = '';
      }, 500);
    }, 45000);
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
  
  // Add story word counts to the game state
  function addStoryWordCounts() {
    if (!window.gameState) {
      console.warn('Game state not found, will try again later');
      return;
    }
    
    // Track which stories we've already counted
    const countedStories = JSON.parse(localStorage.getItem('countedStories') || '[]');
    let newStoriesAdded = false;
    
    approvedStories.forEach(story => {
      // Only count each story once
      if (!countedStories.includes(story.id)) {
        const username = story.username.toLowerCase();
        
        // Add word count to user's total
        window.gameState.wordCounts[username] = (window.gameState.wordCounts[username] || 0) + story.wordCount;
        
        // Add to total words
        window.gameState.totalWords += story.wordCount;
        
        // Mark as counted
        countedStories.push(story.id);
        newStoriesAdded = true;
        
        console.log(`📊 Added ${story.wordCount} words from story "${story.title}" to ${username}'s count`);
      }
    });
    
    if (newStoriesAdded) {
      // Save counted stories list
      localStorage.setItem('countedStories', JSON.stringify(countedStories));
      
      // Update the display
      if (typeof window.updateStats === 'function') {
        window.updateStats();
      }
      if (typeof window.updateLeaderboard === 'function') {
        window.updateLeaderboard();
      }
      if (typeof window.saveGameState === 'function') {
        window.saveGameState();
      }
    }
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
    
    // Refresh periodically as backup
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
