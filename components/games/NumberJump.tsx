import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../../services/geminiService';

interface Props {
  onSuccess: () => void;
  onFailure: () => void;
  speak: (text: string) => void;
}

const NumberJump: React.FC<Props> = ({ onSuccess, onFailure, speak }) => {
  const [levelData, setLevelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shakeId, setShakeId] = useState<number | null>(null);
  
  // Use a ref to track history so it persists across re-renders and is available in closures
  const historyRef = useRef<number[]>([]);

  const loadLevel = async () => {
    setLoading(true);
    // Pass the current history to the service to exclude these numbers
    const data = await geminiService.generateGameContent('number_jump', 1, historyRef.current);
    if (data) {
        setLevelData(data);
        speak(data.question);
        
        // Update history: Add new target, keep only last 3 to ensure variety
        const newHistory = [...historyRef.current, data.target];
        if (newHistory.length > 3) newHistory.shift();
        historyRef.current = newHistory;
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNumberClick = (num: number, idx: number) => {
    if (!levelData) return;
    
    if (num === levelData.target) {
      onSuccess();
      setTimeout(loadLevel, 2000);
    } else {
      setShakeId(idx);
      onFailure();
      setTimeout(() => setShakeId(null), 500);
    }
  };

  if (loading) return <div className="text-center text-3xl font-display text-buddy-pink animate-pulse mt-10">🐰 BunBun is thinking...</div>;

  if (!levelData) return <div className="text-center">Oops, something went wrong. <button onClick={loadLevel} className="underline">Try again</button></div>;

  // Shuffle target into distractors
  const allNumbers = [...levelData.distractors, levelData.target].sort(() => Math.random() - 0.5);

  return (
    <div className="text-center w-full">
      <h2 className="text-3xl md:text-4xl font-display text-buddy-purple mb-8 drop-shadow-sm">{levelData.question}</h2>
      
      <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto">
        {allNumbers.map((num, idx) => (
          <button
            key={idx}
            onClick={() => handleNumberClick(num, idx)}
            className={`
              aspect-square rounded-[2rem] bg-gradient-to-b from-white to-gray-50 
              shadow-b-8 border-2 border-gray-100
              active:shadow-none active:translate-y-2 active:border-t-4
              transition-all duration-100
              flex items-center justify-center 
              text-5xl md:text-7xl font-display font-bold text-buddy-blue 
              hover:bg-blue-50 hover:scale-105
              ${shakeId === idx ? 'animate-shake bg-red-50 border-red-200' : ''}
            `}
            style={{ boxShadow: shakeId === idx ? '0 8px 0 #FECACA' : '0 8px 0 #E0F2F1' }}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NumberJump;