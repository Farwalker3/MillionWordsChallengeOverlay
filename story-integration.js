// Story Integration for Million Words Challenge Overlay
// Add this script to your index.html before the closing </body> tag:
// <script src="story-integration.js"></script>

(function() {
  const API_BASE = '/api'; // Update if your backend is hosted elsewhere
  let approvedStories = [];
  let currentStoryIndex = 0;
  
  // Fetch approved stories from backend
  async function fetchApprovedStories() {
    try {
      const response = await fetch(`${API_BASE}/stories/approved`);
      if (response.ok) {
        approvedStories = await response.json();
        console.log(`✅ Loaded ${approvedStories.length} approved stories`);
        
        if (approvedStories.length > 0) {
          displayNextStory();
        }
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  }
  
  // Display story in the overlay
  function displayNextStory() {
    if (approvedStories.length === 0) return;
    
    const story = approvedStories[currentStoryIndex];
    
    // Check if story display functions exist in main overlay
    if (typeof showStoryTicker === 'function') {
      showStoryTicker(story);
    } else {
      console.warn('showStoryTicker function not found in main overlay');
    }
    
    // Move to next story
    currentStoryIndex = (currentStoryIndex + 1) % approvedStories.length;
    
    // Schedule next story display (every 2-5 minutes based on queue size)
    const displayInterval = calculateDisplayInterval();
    setTimeout(displayNextStory, displayInterval);
  }
  
  // Calculate how often to show stories based on queue size
  function calculateDisplayInterval() {
    const baseInterval = 3 * 60 * 1000; // 3 minutes
    const minInterval = 2 * 60 * 1000; // 2 minutes
    const maxInterval = 5 * 60 * 1000; // 5 minutes
    
    if (approvedStories.length === 0) return maxInterval;
    if (approvedStories.length < 5) return maxInterval;
    if (approvedStories.length < 20) return baseInterval;
    return minInterval;
  }
  
  // Refresh stories periodically
  function startStoryRefresh() {
    setInterval(fetchApprovedStories, 5 * 60 * 1000); // Refresh every 5 minutes
  }
  
  // Initialize
  console.log('📚 Story integration loaded');
  fetchApprovedStories();
  startStoryRefresh();
  
  // Expose functions globally if needed
  window.storyIntegration = {
    refresh: fetchApprovedStories,
    getStoryCount: () => approvedStories.length
  };
})();
