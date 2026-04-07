import { useState, useEffect } from 'react';

const SoundToggle = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('es_sound') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('es_sound', soundEnabled.toString());
  }, [soundEnabled]);

  return (
    <button
      className="sound-toggle"
      onClick={() => setSoundEnabled(!soundEnabled)}
      aria-label="Toggle sound\"
     >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  );
};

export default SoundToggle;
