import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';

interface Props {
  onSuccess: () => void;
  onFailure: () => void;
  speak: (text: string) => void;
}

const RoboPuzzle: React.FC<Props> = ({ onSuccess, onFailure, speak }) => {
  const [levelData, setLevelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadLevel = async () => {
    setLoading(true);
    const data = await geminiService.generateGameContent('robo_puzzle', 1);
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

  const handleOptionClick = (option: string) => {
    if (option === levelData.correctAnswer) {
      onSuccess();
      setTimeout(loadLevel, 2000);
    } else {
      onFailure();
    }
  };

  if (loading) return <div className="text-center text-2xl font-display text-gray-500 animate-pulse">Robo is computing...</div>;
  if (!levelData) return null;

  const allOptions = [levelData.correctAnswer, ...levelData.options].sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-3xl font-display text-buddy-blue mb-8">{levelData.question}</h2>
      
      {/* Pattern Display */}
      <div className="flex space-x-2 md:space-x-4 mb-10 bg-gray-100 p-4 rounded-2xl">
        {levelData.sequence.map((item: string, idx: number) => (
           <div key={idx} className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-lg shadow-md border-2 border-blue-200 flex items-center justify-center font-bold text-xl md:text-2xl text-gray-700">
             {item === '?' ? <span className="animate-pulse text-4xl text-blue-500">?</span> : item}
           </div>
        ))}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {allOptions.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionClick(opt)}
            className="py-4 bg-buddy-blue text-white rounded-xl shadow-lg font-display text-xl hover:bg-blue-600 transition-colors border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoboPuzzle;
