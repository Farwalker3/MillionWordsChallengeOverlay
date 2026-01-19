// Firebase Configuration
// Replace with your actual Firebase config from Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyABnfB__3Pf1UnGXGz6rDiv9o2V7Q_WIZY",
  authDomain: "million-words-challenge-stream.firebaseapp.com",
  projectId: "million-words-challenge-stream",
  storageBucket: "million-words-challenge-stream.firebasestorage.app",
  messagingSenderId: "664783773691",
  appId: "1:664783773691:web:9af32346a4b1cc35df355e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Content filtering function
function checkContent(text, title = '') {
  const bannedWords = [
    'fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'cock', 'dick', 
    'pussy', 'cunt', 'bastard', 'whore', 'slut'
  ];
  
  const lowerText = (text + ' ' + title).toLowerCase();
  
  // Check for banned words
  for (const word of bannedWords) {
    if (lowerText.includes(word)) {
      return { passed: false, reason: 'Contains inappropriate language' };
    }
  }
  
  // Check for excessive caps
  const caps = (text.match(/[A-Z]/g) || []).length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  if (letters > 50 && caps / letters > 0.5) {
    return { passed: false, reason: 'Excessive use of capital letters' };
  }
  
  return { passed: true };
}

// Calculate word count
function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// Check if user is banned
async function isUserBanned(username) {
  try {
    const doc = await db.collection('bannedUsers').doc(username.toLowerCase()).get();
    return doc.exists;
  } catch (error) {
    console.error('Error checking banned user:', error);
    return false;
  }
}

// Export for use in other files
window.firebaseApp = {
  db,
  checkContent,
  countWords,
  isUserBanned
};
