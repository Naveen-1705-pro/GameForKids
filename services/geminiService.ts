import { GoogleGenAI, Modality, Type } from "@google/genai";
import { CharacterId } from "../types";
import { CHARACTERS } from "../constants";

// Cache for specific text-to-speech results to save calls if repeated
const AUDIO_CACHE: Map<string, string> = new Map();

interface FeedbackItem {
  text: string;
  audio: string;
}

// Buffer to store pre-generated feedback: { [charId]: { success: [], failure: [] } }
interface FeedbackBuffer {
  success: FeedbackItem[];
  failure: FeedbackItem[];
}

export class GeminiService {
  private ai: GoogleGenAI;
  private feedbackBuffers: Record<string, FeedbackBuffer> = {};
  private isPrefetching: Record<string, boolean> = {};

  constructor() {
    // API KEY is assumed to be in process.env.API_KEY
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // --- TTS Generation ---
  async generateCharacterSpeech(characterId: CharacterId, text: string): Promise<string | null> {
    const cacheKey = `${characterId}:${text}`;
    if (AUDIO_CACHE.has(cacheKey)) {
      return AUDIO_CACHE.get(cacheKey) || null;
    }

    try {
      const char = CHARACTERS[characterId];
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: char.voiceName },
            },
          },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (audioData) {
        AUDIO_CACHE.set(cacheKey, audioData);
        return audioData;
      }
      return null;
    } catch (error) {
      console.error("Error generating speech:", error);
      return null;
    }
  }

  // --- Game Logic Generation ---
  async generateGameContent(gameType: string, level: number, history: any[] = []): Promise<any> {
    let prompt = "";
    let schema = {};

    switch (gameType) {
      case 'number_jump':
        const excludeNumbers = history.length > 0 
          ? `IMPORTANT: The target number MUST NOT be one of these: ${history.join(', ')}. Pick a different number.` 
          : "";
          
        prompt = `Generate a simple counting question for a ${level + 2} year old. 
        ${excludeNumbers}
        Return a target number (1-10) and an array of 8 distractor numbers.
        Also provide a short encouraging question text like "Can you find the number 5?".`;
        schema = {
          type: Type.OBJECT,
          properties: {
            target: { type: Type.NUMBER },
            distractors: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            question: { type: Type.STRING },
          },
          required: ["target", "distractors", "question"]
        };
        break;
      
      case 'alphabet_catch':
         const excludeLetters = history.length > 0 
           ? `IMPORTANT: The target letter MUST NOT be one of these: ${history.join(', ')}.` 
           : "";

         prompt = `Generate a letter recognition task for a child.
         ${excludeLetters}
         Return a target letter (A-Z) and a list of 5 distractor letters.
         Also provide a question text like "Catch the letter B!".`;
         schema = {
          type: Type.OBJECT,
          properties: {
            target: { type: Type.STRING },
            distractors: { type: Type.ARRAY, items: { type: Type.STRING } },
            question: { type: Type.STRING },
          },
          required: ["target", "distractors", "question"]
        };
        break;

      case 'color_magic':
        prompt = `Generate a color mixing challenge.
        Return a target color name (e.g., Purple, Orange, Green) and the two primary colors needed to make it.
        Available inputs: Red, Blue, Yellow, White.
        Also provide a fun prompt like "Let's make Purple magic!".`;
         schema = {
          type: Type.OBJECT,
          properties: {
            targetColor: { type: Type.STRING },
            requiredMix: { type: Type.ARRAY, items: { type: Type.STRING } },
            question: { type: Type.STRING },
          },
          required: ["targetColor", "requiredMix", "question"]
        };
        break;

      case 'robo_puzzle':
        prompt = `Generate a very simple logical sequence pattern.
        e.g. ['Red', 'Blue', 'Red', ?] -> Answer 'Blue'.
        Or numbers [1, 2, 1, ?] -> Answer 2.
        Return the sequence array (with '?' as the missing item) and the correct answer.
        Also provide 3 wrong answer options.`;
        schema = {
          type: Type.OBJECT,
          properties: {
            sequence: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            question: { type: Type.STRING },
          },
          required: ["sequence", "correctAnswer", "options", "question"]
        };
        break;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
      return null;
    } catch (e) {
      console.error("GenAI Error", e);
      // Fallbacks if API fails
      if (gameType === 'number_jump') return { target: 5, distractors: [1,2,3,4,6,7,8,9], question: "Find 5!" };
      return null;
    }
  }

  // --- Buffering System for Feedback ---

  async preloadFeedback(characterId: CharacterId, childName: string) {
    if (this.isPrefetching[characterId]) return;
    this.isPrefetching[characterId] = true;

    if (!this.feedbackBuffers[characterId]) {
      this.feedbackBuffers[characterId] = { success: [], failure: [] };
    }

    const buffer = this.feedbackBuffers[characterId];
    
    // Fill Success Buffer (Target size: 2)
    if (buffer.success.length < 2) {
        const item = await this.generateSingleFeedback(characterId, true, childName);
        if (item) buffer.success.push(item);
    }

    // Fill Failure Buffer (Target size: 2)
    if (buffer.failure.length < 2) {
        const item = await this.generateSingleFeedback(characterId, false, childName);
        if (item) buffer.failure.push(item);
    }

    this.isPrefetching[characterId] = false;
  }

  private async generateSingleFeedback(characterId: CharacterId, isCorrect: boolean, childName: string): Promise<FeedbackItem | null> {
      const char = CHARACTERS[characterId];
      const nameInstruction = childName 
        ? `The child's name is ${childName}. Use it.` 
        : "";
        
      const prompt = `You are ${char.name}, a little friend.
      ${nameInstruction}
      Child answer was: ${isCorrect ? 'CORRECT' : 'WRONG'}.
      
      Generate a very short, simple, happy phrase (max 6 words).
      Examples Correct: "Yay! You did it!", "Super job [Name]!", "Wow, amazing!"
      Examples Wrong: "Oopsie!", "Try again [Name]!", "That's okay!"
      
      Just the text.`;
      
      try {
        // 1. Generate Text
        const txtResp = await this.ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        const text = txtResp.text?.trim() || (isCorrect ? "Yay!" : "Oops!");

        // 2. Generate Audio
        const audio = await this.generateCharacterSpeech(characterId, text);
        
        if (audio) {
            return { text, audio };
        }
      } catch (e) {
          console.error("Feedback Gen Error", e);
      }
      return null;
  }

  // Get feedback from buffer OR generate fallback
  async getEncouragement(characterId: CharacterId, isCorrect: boolean, childName: string): Promise<FeedbackItem> {
     // Initialize buffer if needed
     if (!this.feedbackBuffers[characterId]) {
        this.feedbackBuffers[characterId] = { success: [], failure: [] };
     }

     const buffer = this.feedbackBuffers[characterId];
     const list = isCorrect ? buffer.success : buffer.failure;
     
     // Trigger refill in background
     setTimeout(() => this.preloadFeedback(characterId, childName), 10);

     // Return buffered item if exists
     if (list.length > 0) {
        return list.shift()!;
     }

     // Fallback if buffer empty (Lag occurs here, but rare if preloaded)
     const fallbackText = isCorrect ? "Great job!" : "Oops, try again!";
     const fallbackAudio = await this.generateCharacterSpeech(characterId, fallbackText);
     return { text: fallbackText, audio: fallbackAudio || "" };
  }
}

export const geminiService = new GeminiService();