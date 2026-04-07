import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Submit from './pages/Submit';
import Quiz from './pages/Quiz';
import Exchange from './pages/Exchange';
import Wall from './pages/Wall';
import { ThemeProvider } from './context/ThemeContext';
import { RoomProvider } from './context/RoomContext';

function App() {
  return (
    <ThemeProvider>
      <RoomProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/exchange" element={<Exchange />} />
              <Route path="/wall" element={<Wall />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      </RoomProvider>
    </ThemeProvider>
  );
}

export default App;
