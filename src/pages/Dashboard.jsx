import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import Navigation from '../components/Navigation';
import ThemeToggle from '../components/ThemeToggle';
import SoundToggle from '../components/SoundToggle';
// import * as confetti from 'canvas-confetti'
// const confetti = (await import("canvas-confetti")).default;
import confetti from "canvas-confetti/dist/confetti.module.mjs";

import {
 moodColors,
 moodEmojis,
 calculatePositivity,
 getCollectiveVibe,
 timeAgo
} from '../utils/helpers';

const Dashboard = () => {
 const { currentRoom, leaveRoom } = useRoom();
 const navigate = useNavigate();
 const [moods, setMoods] = useState([]);
 const [trades, setTrades] = useState({});
 const [confessions, setConfessions] = useState([]);
 const [activeUsers, setActiveUsers] = useState(1);
 const [lastConfetti, setLastConfetti] = useState(0);

 // Redirect if no room
 useEffect(() => {
  if (!currentRoom) {
   navigate('/');
  }
 }, [currentRoom, navigate]);

 // Load data from localStorage
 useEffect(() => {
  if (!currentRoom) return;

  const loadData = () => {
   const moodsData = JSON.parse(localStorage.getItem(`es_moods_${currentRoom}`) || '[]');
   const tradesData = JSON.parse(localStorage.getItem(`es_trades_${currentRoom}`) || '{}');
   const confessionsData = JSON.parse(localStorage.getItem(`es_confessions_${currentRoom}`) || '[]');

   setMoods(moodsData);
   setTrades(tradesData);
   setConfessions(confessionsData);

   // Simulate active users based on unique sessions in last hour
   const oneHourAgo = Date.now() - 60 * 60 * 1000;
   const recentSessions = new Set(
    moodsData.filter(m => new Date(m.timestamp).getTime() > oneHourAgo).map(m => m.sessionId)
   );
   setActiveUsers(Math.max(1, recentSessions.size));
  };

  loadData();

  // Poll for updates every 2 seconds
  const interval = setInterval(loadData, 2000);

  // Listen for storage events (cross-tab updates)
  const handleStorage = (e) => {
   if (e.key && e.key.includes(currentRoom)) {
    loadData();
   }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
   clearInterval(interval);
   window.removeEventListener('storage', handleStorage);
  };
 }, [currentRoom]);

 // Confetti trigger
 useEffect(() => {
  const positivity = calculatePositivity(moods);
  if (positivity >= 80 && positivity !== lastConfetti) {
   confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
   });
   setLastConfetti(positivity);
  }
 }, [moods, lastConfetti]);

 if (!currentRoom) return null;

 const positivity = calculatePositivity(moods);
 const vibe = getCollectiveVibe(positivity);
 const totalVolume = moods.length;

 // Calculate mood distribution
 const moodCounts = {};
 Object.keys(moodEmojis).forEach(mood => {
  moodCounts[mood] = moods.filter(m => m.mood === mood).length;
 });

 const maxCount = Math.max(...Object.values(moodCounts), 1);

 // Calculate hourly data for heatmap
 const hourlyData = Array(24).fill(null).map((_, hour) => {
  const hourMoods = moods.filter(m => {
   const moodHour = new Date(m.timestamp).getHours();
   return moodHour === hour;
  });
  return {
   hour,
   count: hourMoods.length,
   positivity: calculatePositivity(hourMoods)
  };
 });

 const currentHour = new Date().getHours();

 // Get positivity color
 const getPositivityColor = () => {
  if (positivity >= 70) return '#10b981';
  if (positivity >= 40) return '#f59e0b';
  return '#ef4444';
 };

 // Get heatmap cell color
 const getHeatmapColor = (pos, count) => {
  if (count === 0) return 'var(--surface2)';
  if (pos >= 70) return '#10b981';
  if (pos >= 50) return '#06b6d4';
  if (pos >= 35) return '#f59e0b';
  if (pos >= 20) return '#f97316';
  return '#ef4444';
 };

 const getHeatmapOpacity = (count) => {
  if (count === 0) return 0.2;
  if (count < 4) return 0.5;
  return 1;
 };

 const handleLeaveRoom = () => {
  if (window.confirm('Are you sure you want to leave this room?')) {
   leaveRoom();
   navigate('/');
  }
 };

 return (
  <div className="dashboard-page">
   <ThemeToggle />
   <SoundToggle />

   <div className="dashboard-header">
    <h1 className="page-title gradient-text">EMOSENSE.AI</h1>
    <div className="room-info">
     <span className="room-code">Room: {currentRoom}</span>
     <button className="btn-leave" onClick={handleLeaveRoom}>Leave</button>
    </div>
   </div>

   <div className="dashboard-content">
    {/* Burnout Alert */}
    {positivity < 30 && totalVolume > 5 && (
     <div className="burnout-alert">
      <span className="alert-icon">⚠️</span>
      <span>High stress levels detected. Team might need support.</span>
     </div>
    )}

    {/* Stats Grid */}
    <div className="stats-grid">
     {/* Collective Vibe Weather */}
     <div className="stat-card weather-card">
      <h3 className="card-label gradient-text">TODAY'S EMOTIONAL WEATHER</h3>
      <div className="weather-icon-large">
       <div className={`weather-animation weather-${positivity >= 70 ? 'sunny' : positivity >= 50 ? 'partly-cloudy' : positivity >= 35 ? 'cloudy' : positivity >= 20 ? 'rainy' : 'stormy'}`}>
        {vibe.emoji}
       </div>
      </div>
      <div className="vibe-text">{vibe.text}</div>
      <div className="feels-like">
       Feels like: {positivity >= 70 ? 'Warm & Energetic ☀️' : positivity >= 50 ? 'Mild & Motivated 🌤️' : positivity >= 35 ? 'Cool & Uncertain 🌥️' : positivity >= 20 ? 'Cold & Heavy 🌧️' : 'Stormy & Intense ⛈️'}
      </div>
     </div>

     {/* Positivity Score */}
     <div className="stat-card">
      <h3 className="card-label">Positivity Score</h3>
      <div className="stat-value" style={{ color: getPositivityColor() }}>
       {positivity}%
      </div>
     </div>

     {/* Active Users */}
     <div className="stat-card">
      <h3 className="card-label">Active Users</h3>
      <div className="stat-value">
       <span className="pulse-ring"></span>
       {activeUsers}
      </div>
     </div>

     {/* Total Volume */}
     <div className="stat-card">
      <h3 className="card-label">Total Vol</h3>
      <div className="stat-value">{totalVolume}</div>
     </div>
    </div>

    {/* Market Distribution */}
    <div className="section">
     <h2 className="section-title gradient-text">MARKET DISTRIBUTION</h2>
     <div className="mood-bars">
      {Object.entries(moodEmojis).map(([mood, emoji]) => {
       const count = moodCounts[mood];
       const percentage = totalVolume > 0 ? (count / totalVolume) * 100 : 0;
       return (
        <div key={mood} className="mood-bar-row">
         <div className="mood-label">
          <span className="mood-emoji">{emoji}</span>
          <span className="mood-name">{mood.charAt(0).toUpperCase() + mood.slice(1).replace('-', ' ')}</span>
         </div>
         <div className="mood-bar-container">
          <div
           className="mood-bar-fill"
           style={{
            width: `${(count / maxCount) * 100}%`,
            background: `linear-gradient(90deg, ${moodColors[mood]}, ${moodColors[mood]}aa)`,
            borderColor: moodColors[mood]
           }}
          ></div>
         </div>
         <div className="mood-percentage" style={{ color: moodColors[mood] }}>
          {percentage.toFixed(1)}%
         </div>
        </div>
       );
      })}
     </div>
    </div>

    {/* 24-Hour Energy Heatmap */}
    <div className="section">
     <h2 className="section-title gradient-text">⚡ 24-HOUR ENERGY MAP</h2>
     <div className="heatmap-grid">
      {hourlyData.map(({ hour, count, positivity: hourPos }) => (
       <div
        key={hour}
        className={`heatmap-cell ${hour === currentHour ? 'current-hour' : ''}`}
        style={{
         backgroundColor: getHeatmapColor(hourPos, count),
         opacity: getHeatmapOpacity(count)
        }}
        title={`${hour}:00 · ${count} submissions · ${hourPos}% positive`}
       >
        {hour === 0 || hour === 6 || hour === 12 || hour === 18 ? (
         <div className="hour-label">{hour}</div>
        ) : null}
       </div>
      ))}
     </div>
     <div className="heatmap-legend">
      <span>🔴 Stressed</span>
      <span>→</span>
      <span>🟢 Energized</span>
     </div>
    </div>

    {/* Live Feed */}
    <div className="section\">
     <h2 className="section-title live-feed-title\">
      <span className="live-dot\"></span>
      LIVE FEED
     </h2>
     <div className="live-feed\">
      {moods.length === 0 ? (
       <div className="empty-state\">No moods submitted yet. Be the first! 🚀</div>
      ) : (
       moods.slice(-10).reverse().map((mood, idx) => (
        <div key={idx} className="feed-item\" style={{ borderLeftColor: moodColors[mood.mood] }}>
         <span className="feed-emoji\">{moodEmojis[mood.mood]}</span>
         <span className="feed-mood\">{mood.mood.charAt(0).toUpperCase() + mood.mood.slice(1).replace('-', ' ')}</span>
         <span className="feed-time\">{timeAgo(mood.timestamp)}</span>
        </div>
       ))
      )}
     </div>
    </div>
   </div>

   <Navigation />
  </div>
 );
};

export default Dashboard;
