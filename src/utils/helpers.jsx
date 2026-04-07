// Generate unique session ID
export const getSessionId = () => {
  let sessionId = localStorage.getItem('es_session_id');
  if (!sessionId) {
    sessionId = 'user_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('es_session_id', sessionId);
  }
  return sessionId;
};

// Generate room code
export const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Get random avatar emoji
const avatars = ['🦊', '🐺', '🦋', '🐸', '🦅', '🐙', '🦁', '🐯', '🦄', '🐲', '🌚', '🐝'];
export const getAvatar = (sessionId) => {
  const hash = sessionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatars[hash % avatars.length];
};

// Mood colors
export const moodColors = {
  frustrated: '#ef4444',
  anxious: '#f97316',
  'burnt-out': '#6366f1',
  neutral: '#6b7280',
  focused: '#06b6d4',
  excited: '#10b981',
  happy: '#f59e0b',
  inspired: '#ec4899'
};

// Mood emojis
export const moodEmojis = {
  frustrated: '😤',
  anxious: '😰',
  'burnt-out': '🥴',
  neutral: '😐',
  focused: '🎯',
  excited: '🚀',
  happy: '😊',
  inspired: '✨'
};

// Format time ago
export const timeAgo = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Calculate positivity score
export const calculatePositivity = (moods) => {
  if (!moods || moods.length === 0) return 0;
  const positiveMoods = ['focused', 'excited', 'happy', 'inspired'];
  const positiveCount = moods.filter(m => positiveMoods.includes(m.mood)).length;
  return Math.round((positiveCount / moods.length) * 100);
};

// Get collective vibe
export const getCollectiveVibe = (positivity) => {
  if (positivity >= 70) return { text: 'Energized & Thriving', emoji: '☀️' };
  if (positivity >= 50) return { text: 'Steady & Motivated', emoji: '🌤️' };
  if (positivity >= 35) return { text: 'Mixed & Uncertain', emoji: '🌥️' };
  if (positivity >= 20) return { text: 'Heavy & Tense', emoji: '🌧️' };
  return { text: 'Stressed Out', emoji: '⛈️' };
};

// Play sound effect
export const playSound = (type) => {
  const soundEnabled = localStorage.getItem('es_sound') === 'true';
  if (!soundEnabled) return;

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  switch (type) {
    case 'submit':
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.3);
      break;
    case 'pop':
      oscillator.frequency.value = 400;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
      break;
    case 'buy':
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
      break;
    case 'sell':
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
      break;
    default:
      break;
  }
};
