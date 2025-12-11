export enum NoteName {
  C = 'C',
  CSharp = 'C#',
  D = 'D',
  DSharp = 'D#',
  E = 'E',
  F = 'F',
  FSharp = 'F#',
  G = 'G',
  GSharp = 'G#',
  A = 'A',
  ASharp = 'A#',
  B = 'B'
}

export enum ShapeName {
  C = 'C',
  A = 'A',
  G = 'G',
  E = 'E',
  D = 'D'
}

export interface FingerPosition {
  string: number; // 1-6, 1 is high E
  fretOffset: number; // Relative to the nut/capo
  finger: number; // 0=open/barre, 1=index, 2=middle, 3=ring, 4=pinky
  isRoot: boolean;
}

export interface CagedShape {
  name: ShapeName;
  baseRootNoteIndex: number; // 0-11, C=0. The root note of this shape in open position.
  positions: FingerPosition[];
  barreWidth?: number[]; // [startString, endString]
}

export interface ChordInstance {
  shapeName: ShapeName;
  fretPosition: number; // The fret where the "nut" or barre is
  actualRootNote: string;
  notes: { string: number; fret: number; isRoot: boolean; finger: number }[];
}
