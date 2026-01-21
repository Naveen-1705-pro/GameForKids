export enum CharacterId {
  BUNBUN = 'bunbun',
  KIKO = 'kiko',
  LUNA = 'luna',
  ROBO = 'robo'
}

export interface Character {
  id: CharacterId;
  name: string;
  emoji: string;
  color: string;
  description: string;
  skill: string;
  voiceName: string; // Gemini TTS voice name
  bgGradient: string;
}

export interface GameState {
  score: number;
  level: number;
  stars: number;
}

export enum GameType {
  NUMBER_JUMP = 'number_jump',
  ALPHABET_CATCH = 'alphabet_catch',
  COLOR_MAGIC = 'color_magic',
  ROBO_PUZZLE = 'robo_puzzle'
}
