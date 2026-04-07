import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import Navigation from '../components/Navigation';
import ThemeToggle from '../components/ThemeToggle';
import { moodEmojis, moodColors, playSound } from '../utils/helpers';

const Exchange = () => {
  const { currentRoom, sessionId } = useRoom();
  const navigate = useNavigate();
  const [trades, setTrades] = useState({});
  const [userTrades, setUserTrades] = useState({});

  useEffect(() => {
    if (!currentRoom) {
      navigate('/');
      return;
    }

    const loadTrades = () => {
      const tradesData = JSON.parse(localStorage.getItem(`es_trades_${currentRoom}`) || '{}');
      const userTradesData = JSON.parse(localStorage.getItem(`es_user_trades_${currentRoom}_${sessionId}`) || '{}');
      
      setTrades(tradesData);
      setUserTrades(userTradesData);
    };

    loadTrades();

    // Poll for updates
    const interval = setInterval(loadTrades, 2000);

    // Storage event listener
    const handleStorage = (e) => {
      if (e.key && e.key.includes(currentRoom)) {
        loadTrades();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentRoom, sessionId, navigate]);

  const handleTrade = (mood, action) => {
    if (userTrades[mood]) return; // Already traded

    // Update trades data
    const newTrades = { ...trades };
    if (!newTrades[mood]) {
      newTrades[mood] = { buy: 0, sell: 0 };
    }
    newTrades[mood][action]++;

    // Update user trades
    const newUserTrades = { ...userTrades, [mood]: action };

    // Save to localStorage
    localStorage.setItem(`es_trades_${currentRoom}`, JSON.stringify(newTrades));
    localStorage.setItem(`es_user_trades_${currentRoom}_${sessionId}`, JSON.stringify(newUserTrades));

    setTrades(newTrades);
    setUserTrades(newUserTrades);

    // Play sound
    playSound(action);
  };

  if (!currentRoom) return null;

  // Calculate market stats
  let totalBuys = 0;
  let totalSells = 0;
  let mostBullish = null;
  let mostBearish = null;
  let maxBullishNet = -Infinity;
  let maxBearishNet = Infinity;

  Object.entries(moodEmojis).forEach(([mood]) => {
    const buy = trades[mood]?.buy || 0;
    const sell = trades[mood]?.sell || 0;
    const net = buy - sell;

    totalBuys += buy;
    totalSells += sell;

    if (net > maxBullishNet) {
      maxBullishNet = net;
      mostBullish = mood;
    }
    if (net < maxBearishNet) {
      maxBearishNet = net;
      mostBearish = mood;
    }
  });

  const marketSentiment = totalBuys > totalSells ? 'Bullish 📈' : totalSells > totalBuys ? 'Bearish 📉' : 'Neutral ➡️';
  const totalTrades = totalBuys + totalSells;

  return (
    <div className="exchange-page">
      <ThemeToggle />

      <div className="exchange-content">
        <h1 className="page-title gradient-text">📈 EMOTION EXCHANGE</h1>
        <p className="exchange-subtitle">Trade emotions like assets. Buy what you feel, sell what you resist.</p>

        {/* Market Summary */}
        <div className="market-summary">
          <div className="summary-card">
            <div className="summary-label">Market Sentiment</div>
            <div className="summary-value">{marketSentiment}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Total Trades Today</div>
            <div className="summary-value">{totalTrades}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">🐂 Most Bullish</div>
            <div className="summary-value" style={{ color: mostBullish ? moodColors[mostBullish] : 'inherit' }}>
              {mostBullish ? `${moodEmojis[mostBullish]} ${mostBullish.charAt(0).toUpperCase() + mostBullish.slice(1).replace('-', ' ')}` : 'N/A'}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">🐻 Most Bearish</div>
            <div className="summary-value" style={{ color: mostBearish ? moodColors[mostBearish] : 'inherit' }}>
              {mostBearish ? `${moodEmojis[mostBearish]} ${mostBearish.charAt(0).toUpperCase() + mostBearish.slice(1).replace('-', ' ')}` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Trading Floor */}
        <div className="trading-floor">
          {Object.entries(moodEmojis).map(([mood, emoji]) => {
            const buy = trades[mood]?.buy || 0;
            const sell = trades[mood]?.sell || 0;
            const net = buy - sell;
            const userAction = userTrades[mood];

            return (
              <div key={mood} className="trade-row">
                <div className="trade-mood">
                  <span className="trade-emoji">{emoji}</span>
                  <span className="trade-name">
                    {mood.charAt(0).toUpperCase() + mood.slice(1).replace('-', ' ')}
                  </span>
                </div>

                <div className="trade-actions">
                  <button
                    className={`trade-btn buy-btn ${userAction === 'buy' ? 'traded' : ''}`}
                    onClick={() => handleTrade(mood, 'buy')}
                    disabled={!!userAction}
                  >
                    {userAction === 'buy' ? '✓ Bought' : `▲ BUY ${buy}`}
                  </button>
                  <button
                    className={`trade-btn sell-btn ${userAction === 'sell' ? 'traded' : ''}`}
                    onClick={() => handleTrade(mood, 'sell')}
                    disabled={!!userAction}
                  >
                    {userAction === 'sell' ? '✓ Sold' : `▼ SELL ${sell}`}
                  </button>
                </div>

                <div className="trade-net">
                  <span className={`net-value ${net > 0 ? 'positive' : net < 0 ? 'negative' : 'neutral'}`}>
                    NET: {net > 0 ? '+' : ''}{net}
                  </span>
                  <span className="net-indicator"> 
                    {net > 0 ? '📈' : net < 0 ? '📉' : '➡️'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="exchange-note">
          💡 Each mood can only be traded once. BUY = "I feel this", SELL = "I resist this"
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Exchange;
