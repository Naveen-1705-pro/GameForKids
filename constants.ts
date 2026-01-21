import { Character, CharacterId, GameType } from './types';

export const CHARACTERS: Record<CharacterId, Character> = {
  [CharacterId.BUNBUN]: {
    id: CharacterId.BUNBUN,
    name: "BunBun",
    emoji: "🐰",
    color: "bg-buddy-pink",
    description: "I love jumping on numbers!",
    skill: "Numbers & Counting",
    voiceName: "Puck", // Playful, mischievous - great for a bunny
    bgGradient: "from-pink-300 to-purple-300"
  },
  [CharacterId.KIKO]: {
    id: CharacterId.KIKO,
    name: "Kiko",
    emoji: "🐵",
    color: "bg-buddy-orange",
    description: "Let's catch some letters!",
    skill: "Alphabet & Phonics",
    voiceName: "Fenrir", // Energetic - good for a monkey
    bgGradient: "from-orange-300 to-yellow-300"
  },
  [CharacterId.LUNA]: {
    id: CharacterId.LUNA,
    name: "Luna",
    emoji: "🐱",
    color: "bg-buddy-purple",
    description: "Magic colors are everywhere.",
    skill: "Colors & Creativity",
    voiceName: "Kore", // Calm, sweet - good for a cat
    bgGradient: "from-purple-300 to-blue-300"
  },
  [CharacterId.ROBO]: {
    id: CharacterId.ROBO,
    name: "RoboTiny",
    emoji: "🤖",
    color: "bg-buddy-blue",
    description: "Beep boop. Logic is fun.",
    skill: "Logic & Puzzles",
    voiceName: "Zephyr", // Friendly, higher pitch than Charon - better for a "Tiny" robot
    bgGradient: "from-blue-300 to-cyan-300"
  }
};

export const GAME_CONFIGS = {
  [CharacterId.BUNBUN]: { type: GameType.NUMBER_JUMP, title: "Number Jump" },
  [CharacterId.KIKO]: { type: GameType.ALPHABET_CATCH, title: "Alphabet Catch" },
  [CharacterId.LUNA]: { type: GameType.COLOR_MAGIC, title: "Color Magic" },
  [CharacterId.ROBO]: { type: GameType.ROBO_PUZZLE, title: "Robo Puzzle" },
};
