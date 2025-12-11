import { getNoteFrequency } from './constants';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    // Lazy init
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public strumChord(notes: { string: number; fret: number }[], speed: 'slow' | 'fast' = 'slow') {
    this.init();
    if (!this.ctx || !this.gainNode) return;

    this.resume();
    const now = this.ctx.currentTime;
    const strumDuration = speed === 'fast' ? 0.05 : 0.15; // Time between strings

    // Sort notes by string index (6 down to 1) -> Low pitch to high pitch
    // In our data, string 1 is high E, 6 is low E.
    // We want to strum Low E (6) to High E (1).
    const sortedNotes = [...notes].sort((a, b) => b.string - a.string);

    sortedNotes.forEach((note, index) => {
      // 0-based index for frequencies array where 0 is High E (string 1)
      const stringArrayIdx = note.string - 1; 
      const frequency = getNoteFrequency(stringArrayIdx, note.fret);
      
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle'; // Guitar-ish
      osc.frequency.setValueAtTime(frequency, now + (index * strumDuration));

      // Envelope
      gain.gain.setValueAtTime(0, now + (index * strumDuration));
      gain.gain.linearRampToValueAtTime(0.3, now + (index * strumDuration) + 0.01); // Attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + (index * strumDuration) + 1.5); // Decay

      osc.connect(gain);
      gain.connect(this.gainNode!);

      osc.start(now + (index * strumDuration));
      osc.stop(now + (index * strumDuration) + 1.5);
    });
  }
}

export const audioEngine = new AudioEngine();
