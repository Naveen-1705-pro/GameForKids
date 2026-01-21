import React, { useState } from 'react';
import { CharacterId, GameType } from './types';
import { CHARACTERS, GAME_CONFIGS } from './constants';
import CharacterCard from './components/CharacterCard';
import GameShell from './components/GameShell';
import NumberJump from './components/games/NumberJump';
import AlphabetCatch from './components/games/AlphabetCatch';
import ColorMagic from './components/games/ColorMagic';
import RoboPuzzle from './components/games/RoboPuzzle';
import { globalAudioQueue } from './services/audioUtils';

const App: React.FC = () => {
  const [selectedChar, setSelectedChar] = useState<CharacterId | null>(null);
  const [childName, setChildName] = useState("");

  // Resume audio context on user interaction
  const handleUserInteraction = () => {
    globalAudioQueue.resume();
  };

  const renderGame = (characterId: CharacterId) => {
    const config = GAME_CONFIGS[characterId];
    
    return (
      <GameShell 
        characterId={characterId} 
        childName={childName}
        onBack={() => setSelectedChar(null)}
      >
        {({ handleSuccess, handleFailure, speak }) => {
          switch (config.type) {
            case GameType.NUMBER_JUMP:
              return <NumberJump onSuccess={handleSuccess} onFailure={handleFailure} speak={speak} />;
            case GameType.ALPHABET_CATCH:
              return <AlphabetCatch onSuccess={handleSuccess} onFailure={handleFailure} speak={speak} />;
            case GameType.COLOR_MAGIC:
              return <ColorMagic onSuccess={handleSuccess} onFailure={handleFailure} speak={speak} />;
            case GameType.ROBO_PUZZLE:
              return <RoboPuzzle onSuccess={handleSuccess} onFailure={handleFailure} speak={speak} />;
            default:
              return <div>Game not found</div>;
          }
        }}
      </GameShell>
    );
  };

  if (selectedChar) {
    return (
      <div onClick={handleUserInteraction}>
        {renderGame(selectedChar)}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center py-10 px-4 font-sans" onClick={handleUserInteraction}>
      {/* Background Shapes */}
      <div className="absolute top-10 left-10 text-buddy-blue opacity-20 animate-float">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="40" /></svg>
      </div>
      <div className="absolute top-40 right-20 text-buddy-yellow opacity-30 animate-pulse">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor"><path d="M50 0L61 35H98L68 57L79 91L50 70L21 91L32 57L2 35H39L50 0Z" /></svg>
      </div>
      <div className="absolute bottom-20 left-20 text-buddy-pink opacity-20 animate-float" style={{ animationDelay: '2s' }}>
        <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor"><rect x="10" y="10" width="80" height="80" rx="20" /></svg>
      </div>

      <header className="text-center mb-10 relative z-10 w-full max-w-2xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-display text-buddy-blue drop-shadow-[0_5px_0_rgba(0,0,0,0.1)] mb-6 animate-wiggle">
          BuddyVerse
        </h1>
        
        {/* Name Input */}
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border-4 border-white mb-6 transform transition-all hover:scale-105 max-w-md mx-auto">
          <label className="block text-buddy-purple font-bold text-xl mb-2 font-display">
            What is your name?
          </label>
          <input 
            type="text" 
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Type your name here..."
            className="w-full text-center text-2xl font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-buddy-pink focus:ring-4 focus:ring-buddy-pink/20 transition-all placeholder:text-gray-300 font-display"
          />
        </div>

        <p className="text-2xl text-gray-500 font-medium font-display tracking-wide bg-white/60 px-6 py-2 rounded-full inline-block">
          Pick a friend to play with! 👇
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full px-4 relative z-10 pb-20">
        {Object.values(CHARACTERS).map((char, index) => (
          <div key={char.id} className="animate-pop" style={{ animationDelay: `${index * 0.1}s` }}>
            <CharacterCard 
              character={char} 
              onClick={() => setSelectedChar(char.id)} 
            />
          </div>
        ))}
      </div>

      <footer className="fixed bottom-4 text-center text-gray-400 text-sm font-bold opacity-70">
        <p>✨ Powered by Google Gemini ✨</p>
      </footer>
    </div>
  );
};

export default App;