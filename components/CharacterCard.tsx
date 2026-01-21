import React from 'react';
import { Character } from '../types';

interface Props {
  character: Character;
  onClick: () => void;
}

const CharacterCard: React.FC<Props> = ({ character, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer group perspective-container w-full max-w-xs mx-auto`}
    >
      <div className={`
        card-3d ${character.bgGradient} bg-gradient-to-br 
        p-6 rounded-[2rem] shadow-xl border-4 border-white
        text-center h-full flex flex-col items-center justify-between 
        transform transition-all duration-300 
        hover:shadow-2xl hover:-translate-y-2
        group-hover:rotate-1
      `}>
        {/* Animated Emoji */}
        <div className="text-8xl mb-4 filter drop-shadow-xl transform group-hover:scale-125 transition-transform duration-500 ease-in-out animate-wiggle">
          {character.emoji}
        </div>
        
        <div>
          <h3 className="text-4xl font-display font-bold text-white mb-2 drop-shadow-md tracking-wide">
            {character.name}
          </h3>
          <p className="text-white/90 font-medium text-lg leading-tight mb-6 font-sans">
            {character.skill}
          </p>
        </div>

        <div className="
          bg-white text-gray-800 rounded-full px-8 py-3 
          font-bold text-lg uppercase tracking-wider font-display
          shadow-lg group-hover:bg-yellow-300 group-hover:text-yellow-900 group-hover:scale-110
          transition-all duration-300
        ">
          Play!
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
