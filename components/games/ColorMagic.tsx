import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';

interface Props {
  onSuccess: () => void;
  onFailure: () => void;
  speak: (text: string) => void;
}

const COLORS: Record<string, string> = {
  Red: 'bg-red-500 text-red-100 border-red-600',
  Blue: 'bg-blue-500 text-blue-100 border-blue-600',
  Yellow: 'bg-yellow-400 text-yellow-900 border-yellow-500',
  White: 'bg-white text-gray-800 border-gray-300',
  Green: 'bg-green-500 border-green-600',
  Purple: 'bg-purple-500 border-purple-600',
  Orange: 'bg-orange-500 border-orange-600'
};

const ColorMagic: React.FC<Props> = ({ onSuccess, onFailure, speak }) => {
  const [levelData, setLevelData] = useState<any>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLevel = async () => {
    setLoading(true);
    setSelectedColors([]);
    const data = await geminiService.generateGameContent('color_magic', 1);
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

  const handleColorSelect = (color: string) => {
    const newSelection = [...selectedColors, color];
    setSelectedColors(newSelection);

    if (newSelection.length === 2) {
      checkMix(newSelection);
    }
  };

  const checkMix = (mix: string[]) => {
    const required = levelData.requiredMix;
    // Check if mix contains all required colors (order doesn't matter)
    const correct = required.every((c: string) => mix.includes(c)) && mix.length === required.length;

    if (correct) {
      onSuccess();
      setTimeout(loadLevel, 2000);
    } else {
      onFailure();
      setTimeout(() => setSelectedColors([]), 1000);
    }
  };

  if (loading) return <div className="text-center text-3xl font-display text-buddy-pink animate-pulse mt-10">✨ Luna is mixing magic...</div>;
  if (!levelData) return null;

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-3xl md:text-4xl font-display text-buddy-pink mb-6 drop-shadow-sm">{levelData.question}</h2>
      
      {/* Cauldron / Mix Area */}
      <div className="w-56 h-56 relative mb-10 group">
         {/* Pot body */}
         <div className="absolute bottom-0 w-full h-40 bg-gray-800 rounded-b-full rounded-t-lg shadow-2xl flex items-center justify-center overflow-hidden border-4 border-gray-700">
             {/* Liquid */}
             <div className={`absolute bottom-0 w-full bg-gray-700 transition-all duration-1000 ${selectedColors.length > 0 ? 'h-full' : 'h-2/3'}`}>
                {/* Mixed Color Overlay */}
                <div className={`w-full h-full opacity-80 transition-colors duration-500 ${selectedColors.length === 0 ? 'bg-gray-700' : ''} ${selectedColors.length === 1 ? COLORS[selectedColors[0]].split(' ')[0] : 'animate-pulse'}`}>
                  {/* Bubbles */}
                  <div className="absolute bottom-0 left-1/4 w-4 h-4 bg-white/30 rounded-full animate-float" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute bottom-0 left-3/4 w-6 h-6 bg-white/30 rounded-full animate-float" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                </div>
             </div>
         </div>
         {/* Pot Rim */}
         <div className="absolute top-16 left-[-10px] w-[calc(100%+20px)] h-8 bg-gray-900 rounded-full shadow-md"></div>
         
         {/* Floating selected colors dropping in */}
         <div className="absolute -top-10 w-full flex justify-center space-x-4">
           {selectedColors.map((c, i) => (
             <div key={i} className={`w-14 h-14 rounded-full ${COLORS[c].split(' ')[0]} shadow-lg animate-bounce border-2 border-white`}></div>
           ))}
         </div>
      </div>

      {/* Paint Buckets */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-md px-4">
        {['Red', 'Blue', 'Yellow', 'White'].map((color) => (
          <button
            key={color}
            onClick={() => handleColorSelect(color)}
            disabled={selectedColors.length >= 2}
            className={`
              ${COLORS[color]} 
              h-20 rounded-2xl shadow-b-6 border-b-6
              active:shadow-none active:translate-y-2 active:border-b-0
              flex items-center justify-center
              font-display font-bold text-2xl tracking-wide
              hover:scale-105 transition-all
              disabled:opacity-50 disabled:grayscale
            `}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorMagic;
