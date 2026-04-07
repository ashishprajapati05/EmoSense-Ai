import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/submit', icon: '😊', label: 'Submit' },
    { path: '/quiz', icon: '🧠', label: 'Quiz' },
    { path: '/exchange', icon: '📈', label: 'Exchange' },
    { path: '/wall', icon: '🧱', label: 'Wall' }
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.path}
          className={`nav-tab ${location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
