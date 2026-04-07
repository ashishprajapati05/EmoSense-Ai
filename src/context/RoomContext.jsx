import { createContext, useContext, useEffect, useState } from 'react';
import { generateRoomCode, getSessionId } from '../utils/helpers';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(() => {
    return localStorage.getItem('es_current_room') || null;
  });
  const [sessionId] = useState(() => getSessionId());

  useEffect(() => {
    if (currentRoom) {
      localStorage.setItem('es_current_room', currentRoom);
    } else {
      localStorage.removeItem('es_current_room');
    }
  }, [currentRoom]);

  const createRoom = () => {
    const code = generateRoomCode();
    const roomData = {
      code,
      created: new Date().toISOString(),
      creator: sessionId
    };
    localStorage.setItem(`es_room_${code}`, JSON.stringify(roomData));
    setCurrentRoom(code);
    return code;
  };

  const joinRoom = (code) => {
    const upperCode = code.toUpperCase();
    const roomData = localStorage.getItem(`es_room_${upperCode}`);
    if (roomData || upperCode.length === 6) {
      if (!roomData) {
        const newRoomData = {
          code: upperCode,
          created: new Date().toISOString(),
          creator: sessionId
        };
        localStorage.setItem(`es_room_${upperCode}`, JSON.stringify(newRoomData));
      }
      setCurrentRoom(upperCode);
      return true;
    }
    return false;
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
  };

  return (
    <RoomContext.Provider value={{ currentRoom, sessionId, createRoom, joinRoom, leaveRoom }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);
