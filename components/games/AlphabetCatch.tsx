import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';

interface Props {
  onSuccess: () => void;
  onFailure: () => void;
  speak: (text: string) => void;
}

const AlphabetCatch: React.FC<Props> = ({ onSuccess, onFailure, speak }) => {
  const [levelData, setLevelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [poppedIndices, setPoppedIndices] = useState<number[]>([]);

  const loadLevel = async () => {
    setLoading(true);
    setPoppedIndices([]);
    const data = await geminiService.generateGameContent('alphabet_catch', 1);
    if (data) {
        setLevelData(data);
        speak(data.question);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLevel();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (letter: string, idx: number) => {
    if (poppedIndices.includes(idx)) return;

    if (letter === levelData.target) {
      onSuccess();
      setPoppedIndices([...poppedIndices, idx]); // Pop the correct one too
      setTimeout(loadLevel, 2000);
    } else {
      onFailure();
      // Temporarily deflate/shake the wrong balloon
      const el = document.getElementById(`balloon-${idx}`);
      if (el) {
        el.classList.add('animate-shake');
        setTimeout(() => el.classList.remove('animate-shake'), 500);
      }
    }
  };

  if (loading) return <div className="text-center text-3xl font-display text-buddy-orange animate-pulse mt-10">🐵 Kiko is finding letters...</div>;
  if (!levelData) return null;

  const allLetters = [...levelData.distractors, levelData.target].sort(() => Math.random() - 0.5);

  const colors = [
    'from-red-300 to-red-400 border-red-500', 
    'from-blue-300 to-blue-400 border-blue-500', 
    'from-green-300 to-green-400 border-green-500', 
    'from-yellow-300 to-yellow-400 border-yellow-500',
    'from-purple-300 to-purple-400 border-purple-500',
    'from-pink-300 to-pink-400 border-pink-500',
  ];

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-display text-buddy-orange mb-10 drop-shadow-sm">{levelData.question}</h2>
      <div className="flex flex-wrap justify-center gap-8 md:gap-12 pb-8">
        {allLetters.map((char, idx) => {
           const colorClass = colors[idx % colors.length];
           const isPopped = poppedIndices.includes(idx);
           
           return (
            <div key={idx} className="relative group">
              <button
                id={`balloon-${idx}`}
                onClick={() => handleClick(char, idx)}
                disabled={isPopped}
                className={`
                  w-24 h-28 md:w-28 md:h-32 rounded-[50%] 
                  bg-gradient-to-br ${colorClass}
                  shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1),5px_5px_15px_rgba(0,0,0,0.2)]
                  flex items-center justify-center 
                  text-5xl font-display font-bold text-white 
                  transform transition-all duration-300
                  ${isPopped ? 'scale-0 opacity-0' : 'animate-float hover:scale-110 hover:-translate-y-2'}
                  cursor-pointer balloon-string
                `}
                style={{ 
                  animationDelay: `${idx * 0.2}s`,
                  animationDuration: `${4 + (idx % 3)}s` 
                }}
              >
                <span className="drop-shadow-md">{char}</span>
                {/* Shine effect */}
                <div className="absolute top-4 left-4 w-6 h-10 bg-white opacity-30 rounded-full transform -rotate-12"></div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlphabetCatch;
