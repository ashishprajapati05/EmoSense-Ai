import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const Landing = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { createRoom, joinRoom, currentRoom } = useRoom();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // If already in a room, redirect to dashboard
  useEffect(() => {
    if (currentRoom) {
      navigate('/dashboard');
    }
  }, [currentRoom, navigate]);

  // If redirecting, render nothing
  if (currentRoom) return null;


  const handleCreate = () => {
    const newCode = createRoom();
    navigate('/dashboard');
  };

  const handleJoin = () => {
    if (code.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }
    const success = joinRoom(code);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid room code');
    }
  };

  return (
    <div className="landing-page">
      <ThemeToggle />
      <div className="landing-content">
        <div className="logo-section">
          <h1 className="logo-text">EmoSense.ai</h1>
          <p className="tagline">Track emotions. Share vibes. Connect anonymously.</p>
        </div>

        <div className="action-cards">
          <div className="action-card">
            <div className="card-icon">🎯</div>
            <h3>Create Room</h3>
            <p>Start your own emotional space</p>
            <button className="btn-primary" onClick={handleCreate}>
              Create New Room
            </button>
          </div>

          <div className="divider-text">OR</div>

          <div className="action-card">
            <div className="card-icon">🚪</div>
            <h3>Join Room</h3>
            <p>Enter a room code to join</p>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              maxLength={6}
              className="room-input"
            />
            {error && <div className="error-text">{error}</div>}
            <button className="btn-secondary" onClick={handleJoin}>
              Join Room
            </button>
          </div>
        </div>

        <div className="features-preview">
          <div className="feature-item">
            <span>🧠</span>
            <span>Mood Quiz</span>
          </div>
          <div className="feature-item">
            <span>📈</span>
            <span>Emotion Trading</span>
          </div>
          <div className="feature-item">
            <span>🧱</span>
            <span>Confessions Wall</span>
          </div>
          <div className="feature-item">
            <span>🔥</span>
            <span>Streak Tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;