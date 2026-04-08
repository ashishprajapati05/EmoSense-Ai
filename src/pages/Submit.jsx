import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import Navigation from '../components/Navigation';
import ThemeToggle from '../components/ThemeToggle';
import { moodColors, moodEmojis, playSound, getAvatar } from '../utils/helpers';

const Submit = () => {
  const { currentRoom, sessionId } = useRoom();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [cooldown, setCooldown] = useState(null);
  const [streak, setStreak] = useState(0);
  const [streakHistory, setStreakHistory] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!currentRoom) {
      navigate('/');
      return;
    }

    // Check cooldown
    const cooldownKey = `es_cooldown_${currentRoom}`;
    const cooldownTime = localStorage.getItem(cooldownKey);
    if (cooldownTime && Date.now() < parseInt(cooldownTime)) {
      setCooldown(parseInt(cooldownTime));
    }

    // Load streak data
    const streakCount = parseInt(localStorage.getItem('es_streak') || '0');
    const lastDate = localStorage.getItem('es_last_date');
    const history = JSON.parse(localStorage.getItem('es_streak_history') || '[false,false,false,false,false,false,false]');
    
    setStreak(streakCount);
    setStreakHistory(history);
  }, [currentRoom, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (!cooldown) return;
    
    const interval = setInterval(() => {
      if (Date.now() >= cooldown) {
        setCooldown(null);
        localStorage.removeItem(`es_cooldown_${currentRoom}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown, currentRoom]);

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('es_last_date');
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = parseInt(localStorage.getItem('es_streak') || '0');
    let history = JSON.parse(localStorage.getItem('es_streak_history') || '[false,false,false,false,false,false,false]');

    if (lastDate === today) {
      // Already submitted today
      return;
    }

    if (lastDate === yesterday) {
      // Continue streak
      newStreak += 1;
    } else if (lastDate !== today) {
      // Reset streak
      newStreak = 1;
      history = [false, false, false, false, false, false, false];
    }

    // Update history
    history.shift();
    history.push(true);

    localStorage.setItem('es_streak', newStreak.toString());
    localStorage.setItem('es_last_date', today);
    localStorage.setItem('es_streak_history', JSON.stringify(history));

    setStreak(newStreak);
    setStreakHistory(history);
  };

  const handleSubmit = () => {
    if (!selectedMood || cooldown) return;

    const moodEntry = {
      mood: selectedMood,
      timestamp: new Date().toISOString(),
      sessionId: sessionId
    };

    // Add to moods
    const moods = JSON.parse(localStorage.getItem(`es_moods_${currentRoom}`) || '[]');
    moods.push(moodEntry);
    localStorage.setItem(`es_moods_${currentRoom}`, JSON.stringify(moods));

    // Set cooldown (30 minutes)
    const cooldownTime = Date.now() + (20 * 60 * 1000);
    localStorage.setItem(`es_cooldown_${currentRoom}`, cooldownTime.toString());
    setCooldown(cooldownTime);

    // Update streak
    updateStreak();

    // Play sound
    playSound('submit');

    // Show success
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset selection
    setSelectedMood(null);
  };

  if (!currentRoom) return null;

  const cooldownRemaining = cooldown ? Math.ceil((cooldown - Date.now()) / 1000 / 60) : 0;

  const getStreakMessage = () => {
    if (streak >= 30) return 'Legendary! 🏆';
    if (streak >= 14) return 'Mood Master! 👑';
    if (streak >= 7) return 'Week Warrior! ⚡';
    if (streak >= 3) return 'Consistent! 🎯';
    return '';
  };

  return (
    <div className="submit-page">
      <ThemeToggle />
      
      <div className="submit-content">
        <h1 className="page-title gradient-text">SUBMIT YOUR MOOD</h1>

        {/* Streak Badge */}
        {streak > 0 && (
          <div className="streak-badge">
            <div className="streak-number">🔥 {streak} Day Streak!</div>
            {getStreakMessage() && (
              <div className="streak-message">{getStreakMessage()}</div>
            )}
            <div className="streak-calendar">
              {streakHistory.map((day, idx) => (
                <div key={idx} className={`streak-day ${day ? 'filled' : ''}`}></div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="success-message">
            ✨ Mood submitted successfully!
          </div>
        )}

        {/* Mood Selection */}
        <div className="mood-grid">
          {Object.entries(moodEmojis).map(([mood, emoji]) => (
            <button
              key={mood}
              className={`mood-option ${selectedMood === mood ? 'selected' : ''}`}
              onClick={() => setSelectedMood(mood)}
              disabled={!!cooldown}
              style={{
                borderColor: selectedMood === mood ? moodColors[mood] : 'transparent',
                backgroundColor: selectedMood === mood ? `${moodColors[mood]}22` : 'var(--surface)'
              }}
            >
              <div className="mood-option-emoji">{emoji}</div>
              <div className="mood-option-name">
                {mood.charAt(0).toUpperCase() + mood.slice(1).replace('-', ' ')}
              </div>
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={!selectedMood || !!cooldown}
        >
          {cooldown ? `Wait ${cooldownRemaining}m` : 'Submit Mood'}
        </button>

        {/* Quiz Link */}
        <button
          className="btn-quiz-link"
          onClick={() => navigate('/quiz')}
        >
          🧠 Discover My Mood
        </button>
      </div>

      <Navigation />
    </div>
  );
};

export default Submit;
