import React, { useEffect, useState } from 'react';
import { Character, CharacterId } from '../types';
import { CHARACTERS } from '../constants';
import { geminiService } from '../services/geminiService';
import { globalAudioQueue } from '../services/audioUtils';
import { ArrowLeft, Star } from 'lucide-react';

// Declare confetti globally since we loaded it via script tag
declare global {
  interface Window {
    confetti: any;
  }
}

interface Props {
  characterId: CharacterId;
  childName: string;
  onBack: () => void;
  children: (helpers: { 
    handleSuccess: () => void; 
    handleFailure: () => void;
    speak: (text: string) => void;
  }) => React.ReactNode;
}

const GameShell: React.FC<Props> = ({ characterId, childName, onBack, children }) => {
  const character = CHARACTERS[characterId];
  const [stars, setStars] = useState(0);
  const [message, setMessage] = useState<string>("Loading game...");
  const [isAnimating, setIsAnimating] = useState(false);
  const [charAnimation, setCharAnimation] = useState('');

  // Preload feedback on mount or when character changes
  useEffect(() => {
    geminiService.preloadFeedback(characterId, childName);
    // Also trigger a second preload shortly after to fill buffer
    setTimeout(() => geminiService.preloadFeedback(characterId, childName), 2000);
  }, [characterId, childName]);

  useEffect(() => {
    // Initial greeting
    const greet = async () => {
      const greetingText = childName 
        ? `Hi ${childName}! I'm ${character.name}. Let's play!` 
        : `Hi! I'm ${character.name}. Let's play!`;
      
      setMessage(greetingText);
      const audio = await geminiService.generateCharacterSpeech(characterId, greetingText);
      if (audio) globalAudioQueue.addToQueue(audio);
    };
    greet();
  }, [characterId, character.name, childName]);

  const speak = async (text: string) => {
    setMessage(text);
    // Visual cue for speaking
    setCharAnimation('animate-bounce');
    setTimeout(() => setCharAnimation(''), 2000);
    
    const audio = await geminiService.generateCharacterSpeech(characterId, text);
    if (audio) globalAudioQueue.addToQueue(audio);
  };

  const handleSuccess = async () => {
    setStars(s => s + 1);
    setIsAnimating(true);
    
    // Trigger Confetti
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F06292', '#FFF176', '#4FC3F7', '#AED581']
      });
    }

    // Get feedback audio instantly from buffer
    const feedback = await geminiService.getEncouragement(characterId, true, childName);
    
    // Play Immediately
    if (feedback.audio) {
        globalAudioQueue.addToQueue(feedback.audio);
    }
    
    // Update visuals
    setMessage(feedback.text);
    setCharAnimation('animate-bounce');
    setTimeout(() => {
      setIsAnimating(false);
      setCharAnimation('');
    }, 1000);
  };

  const handleFailure = async () => {
    setIsAnimating(true);
    setCharAnimation('animate-shake');
    
    // Get feedback audio instantly from buffer
    const feedback = await geminiService.getEncouragement(characterId, false, childName);
    
    // Play Immediately
    if (feedback.audio) {
        globalAudioQueue.addToQueue(feedback.audio);
    }

    // Update visuals
    setMessage(feedback.text);
    
    setTimeout(() => {
      setIsAnimating(false);
      setCharAnimation('');
    }, 1000);
  };

  return (
    <div className={`min-h-screen ${character.color} bg-opacity-30 flex flex-col font-sans transition-colors duration-500`}>
      {/* Header */}
      <header className="px-4 py-3 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-b-4 border-b-4 border-black/5">
        <button 
          onClick={onBack}
          className="bg-white hover:bg-red-50 text-gray-600 p-2 md:p-3 rounded-full shadow-b-4 border border-gray-100 active:shadow-none active:translate-y-1 transition-all"
        >
          <ArrowLeft size={28} className="text-buddy-pink" strokeWidth={3} />
        </button>
        
        <div className="flex items-center space-x-3 bg-yellow-300/20 px-6 py-2 rounded-full border-2 border-yellow-400 shadow-sm">
          <Star className="text-yellow-500 fill-yellow-400 drop-shadow-sm animate-[spin_10s_linear_infinite]" size={32} />
          <span className="font-display text-3xl text-yellow-600 font-bold text-outline">{stars}</span>
        </div>

        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center shadow-md border-2 border-white">
            <span className="text-3xl filter drop-shadow">{character.emoji}</span>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 container mx-auto p-4 max-w-4xl flex flex-col items-center justify-start pt-8">
        
        {/* Character Bubble */}
        <div className="w-full mb-10 flex flex-col items-center relative z-10">
             <div className="relative w-full max-w-lg">
                <div className={`bg-white px-8 py-6 rounded-[2rem] shadow-xl border-4 border-${character.color.replace('bg-', '')} text-center transform transition-all duration-300 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
                  <p className="font-display text-2xl md:text-3xl text-gray-700 leading-relaxed text-outline">
                    {message}
                  </p>
                  {/* Speech bubble arrow */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rotate-45 border-b-4 border-r-4 border-inherit"></div>
                </div>
             </div>
             <div 
               className={`mt-6 text-7xl md:text-8xl cursor-pointer hover:scale-110 transition-transform filter drop-shadow-2xl ${charAnimation}`} 
               onClick={() => speak(message)}
             >
               {character.emoji}
             </div>
        </div>

        {/* Game Content */}
        <div className="w-full bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-4 border-white/80 animate-pop">
           {children({ handleSuccess, handleFailure, speak })}
        </div>

      </main>
    </div>
  );
};

export default GameShell;
