export const decodeAudioData = async (
  base64String: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Gemini TTS returns raw PCM (no header), but sometimes it returns wav if configured?
  // Actually, the new Gemini TTS via `generateContent` with `responseModalities: ['AUDIO']`
  // returns raw PCM at 24000Hz usually.
  // HOWEVER, we need to wrap it or decode it manually if it's raw PCM.
  // The documentation example for TTS uses `decodeAudioData` on the context assuming it can decode the format.
  // BUT the raw PCM example manually decodes it into a buffer.
  // Let's implement the manual PCM decoding for safety as per the "Generate Speech" guide in the prompt
  // which suggests decoding using Int16Array logic if it's raw.
  
  // Wait, the "Generate Speech" example in the prompt actually uses `decode` then `decodeAudioData` (browser native)
  // implying the output IS a container format (like WAV/MP3) OR the guide had a custom decode function.
  // Let's look closer at the prompt's "Generate Speech" example:
  /*
    const audioBuffer = await decodeAudioData(
      decode(base64EncodedAudioString),
      outputAudioContext,
      24000,
      1,
    );
  */
  // It calls a CUSTOM `decodeAudioData` function, not the method on AudioContext.
  // Let's implement THAT custom function.

  return decodeRawPCM(bytes, audioContext);
};

// Helper to decode raw PCM data into an AudioBuffer
async function decodeRawPCM(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert 16-bit integer (-32768 to 32767) to float (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class AudioQueue {
  private queue: AudioBuffer[] = [];
  private isPlaying: boolean = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initContext();
  }

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  }

  public async addToQueue(base64Audio: string) {
    this.initContext();
    if (!this.audioContext) return;
    
    // Decode base64 to bytes
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const buffer = await decodeRawPCM(bytes, this.audioContext);
    this.queue.push(buffer);
    this.playNext();
  }

  private playNext() {
    if (this.isPlaying || this.queue.length === 0 || !this.audioContext) return;

    this.isPlaying = true;
    const buffer = this.queue.shift();
    if (!buffer) {
      this.isPlaying = false;
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    
    source.onended = () => {
      this.isPlaying = false;
      this.playNext();
    };

    source.start();
  }

  public resume() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const globalAudioQueue = new AudioQueue();
