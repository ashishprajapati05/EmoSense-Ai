import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import Navigation from '../components/Navigation';
import ThemeToggle from '../components/ThemeToggle';
import { moodColors, getAvatar, timeAgo, playSound } from '../utils/helpers';

const Wall = () => {
  const { currentRoom, sessionId } = useRoom();
  const navigate = useNavigate();
  const [confessions, setConfessions] = useState([]);
  const [newConfession, setNewConfession] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [userReactions, setUserReactions] = useState({});

  const moods = ['frustrated', 'anxious', 'burnt-out', 'neutral', 'focused', 'excited', 'happy', 'inspired'];
  const reactionEmojis = ['👍', '❤️', '😢', '😂'];

  useEffect(() => {
    if (!currentRoom) {
      navigate('/');
      return;
    }

    const loadConfessions = () => {
      const confessionsData = JSON.parse(localStorage.getItem(`es_confessions_${currentRoom}`) || '[]');
      const userReactionsData = JSON.parse(localStorage.getItem(`es_reactions_${currentRoom}_${sessionId}`) || '{}');
      
      // Filter out confessions older than 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const validConfessions = confessionsData.filter(c => new Date(c.timestamp).getTime() > oneDayAgo);
      
      // Save filtered list
      if (validConfessions.length !== confessionsData.length) {
        localStorage.setItem(`es_confessions_${currentRoom}`, JSON.stringify(validConfessions));
      }

      setConfessions(validConfessions);
      setUserReactions(userReactionsData);
    };

    loadConfessions();

    // Poll for updates
    const interval = setInterval(loadConfessions, 2000);

    // Storage event listener
    const handleStorage = (e) => {
      if (e.key && e.key.includes(currentRoom)) {
        loadConfessions();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentRoom, sessionId, navigate]);

  const handleSubmitConfession = () => {
    if (!newConfession.trim() || newConfession.length > 120) return;

    const confession = {
      id: `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: newConfession.trim(),
      mood: selectedMood,
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      avatar: getAvatar(sessionId),
      reactions: { '👍': 0, '❤️': 0, '😢': 0, '😂': 0 }
    };

    const updated = [...confessions, confession];
    localStorage.setItem(`es_confessions_${currentRoom}`, JSON.stringify(updated));
    setConfessions(updated);
    setNewConfession('');
    setSelectedMood('neutral');
    playSound('pop');
  };

  const handleReaction = (confessionId, emoji) => {
    // Check if already reacted to this confession
    if (userReactions[confessionId]) return;

    // Update confession reactions
    const updated = confessions.map(c => {
      if (c.id === confessionId) {
        return {
          ...c,
          reactions: {
            ...c.reactions,
            [emoji]: (c.reactions[emoji] || 0) + 1
          }
        };
      }
      return c;
    });

    // Update user reactions
    const newUserReactions = { ...userReactions, [confessionId]: emoji };

    localStorage.setItem(`es_confessions_${currentRoom}`, JSON.stringify(updated));
    localStorage.setItem(`es_reactions_${currentRoom}_${sessionId}`, JSON.stringify(newUserReactions));

    setConfessions(updated);
    setUserReactions(newUserReactions);
    playSound('pop');
  };

  if (!currentRoom) return null;

  const displayConfessions = confessions.slice(-20).reverse();

  return (
    <div className="wall-page\">
      <ThemeToggle />

      <div className="wall-content\">
        <h1 className="page-title gradient-text\">🧱 THE WALL</h1>
        <p className="wall-subtitle\">Share anonymous thoughts. No judgment, just understanding.</p>

        {/* Confession Form */}
        <div className="confession-form\">
          <textarea
            className="confession-input\"
            placeholder="Share what's on your mind... (max 120 characters)\"
            value={newConfession}
            onChange={(e) => setNewConfession(e.target.value)}
            maxLength={120}
          />
          <div className="form-footer\">
            <select
              className="mood-select\"
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
            >
              {moods.map(mood => (
                <option key={mood} value={mood}>
                  #{mood}
                </option>
              ))}
            </select>
            <div className="char-count\">{newConfession.length}/120</div>
            <button
              className="btn-post\"
              onClick={handleSubmitConfession}
              disabled={!newConfession.trim() || newConfession.length > 120}
            >
              Post
            </button>
          </div>
        </div>

        {/* Confessions List */}
        <div className="confessions-list\">
          {displayConfessions.length === 0 ? (
            <div className="empty-state\">No confessions yet. Be the first to share! 💬</div>
          ) : (
            displayConfessions.map(confession => (
              <div
                key={confession.id}
                className="confession-card\"
                style={{ borderLeftColor: moodColors[confession.mood] }}
              >
                <div className="confession-header\">
                  <span className="confession-avatar\">{confession.avatar}</span>
                  <span className="confession-mood\">#{confession.mood}</span>
                  <span className="confession-time\">{timeAgo(confession.timestamp)}</span>
                </div>
                <div className="confession-text\">{confession.text}</div>
                <div className="confession-reactions\">
                  {reactionEmojis.map(emoji => {
                    const count = confession.reactions[emoji] || 0;
                    const userReacted = userReactions[confession.id] === emoji;
                    return (
                      <button
                        key={emoji}
                        className={`reaction-btn ${userReacted ? 'reacted' : ''}`}
                        onClick={() => handleReaction(confession.id, emoji)}
                        disabled={!!userReactions[confession.id]}
                      >
                        {emoji} {count > 0 && count}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Wall;
