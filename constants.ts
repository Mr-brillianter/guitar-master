import { NoteName, ShapeName, CagedShape, FingerPosition } from './types';

export const NOTES = [
  NoteName.C, NoteName.CSharp, NoteName.D, NoteName.DSharp, NoteName.E, 
  NoteName.F, NoteName.FSharp, NoteName.G, NoteName.GSharp, NoteName.A, 
  NoteName.ASharp, NoteName.B
];

// Frequencies for E2 (String 6) to E6 (approx range)
// String 6 Open (E2) is ~82.41 Hz
export const STRING_OPEN_FREQUENCIES = [
  329.63, // String 1 (High E) - E4
  246.94, // String 2 (B) - B3
  196.00, // String 3 (G) - G3
  146.83, // String 4 (D) - D3
  110.00, // String 5 (A) - A2
  82.41   // String 6 (Low E) - E2
];

// CAGED Shapes Definitions (Offsets relative to the "Nut" or Barre)
// Finger: 0=Open, 1=Index, 2=Middle, 3=Ring, 4=Pinky
// We define the shapes as they are played in OPEN position.
// The logic in App.tsx will handle shifting fingers for movable shapes.

const SHAPE_C: CagedShape = {
  name: ShapeName.C,
  baseRootNoteIndex: 0, // Open C is C
  positions: [
    { string: 5, fretOffset: 3, finger: 3, isRoot: true }, // Root (Ring)
    { string: 4, fretOffset: 2, finger: 2, isRoot: false }, // Middle
    { string: 3, fretOffset: 0, finger: 0, isRoot: false }, // Open
    { string: 2, fretOffset: 1, finger: 1, isRoot: false }, // Index
    { string: 1, fretOffset: 0, finger: 0, isRoot: false }, // Open
  ]
};

const SHAPE_A: CagedShape = {
  name: ShapeName.A,
  baseRootNoteIndex: 9, // Open A is A
  positions: [
    { string: 5, fretOffset: 0, finger: 0, isRoot: true }, // Root (Open)
    { string: 4, fretOffset: 2, finger: 1, isRoot: false }, // Index
    { string: 3, fretOffset: 2, finger: 2, isRoot: false }, // Middle
    { string: 2, fretOffset: 2, finger: 3, isRoot: false }, // Ring
    { string: 1, fretOffset: 0, finger: 0, isRoot: false }, // Open
  ]
};

const SHAPE_G: CagedShape = {
  name: ShapeName.G,
  baseRootNoteIndex: 7, // Open G is G
  positions: [
    { string: 6, fretOffset: 3, finger: 3, isRoot: true }, // Root (Ring)
    { string: 5, fretOffset: 2, finger: 2, isRoot: false }, // Middle
    { string: 4, fretOffset: 0, finger: 0, isRoot: false }, // Open
    { string: 3, fretOffset: 0, finger: 0, isRoot: false }, // Open
    { string: 2, fretOffset: 0, finger: 0, isRoot: false }, // Open
    { string: 1, fretOffset: 3, finger: 4, isRoot: true }, // Root (Pinky)
  ]
};

const SHAPE_E: CagedShape = {
  name: ShapeName.E,
  baseRootNoteIndex: 4, // Open E is E
  positions: [
    { string: 6, fretOffset: 0, finger: 0, isRoot: true }, // Root (Open)
    { string: 5, fretOffset: 2, finger: 2, isRoot: false }, // Middle
    { string: 4, fretOffset: 2, finger: 3, isRoot: false }, // Ring
    { string: 3, fretOffset: 1, finger: 1, isRoot: false }, // Index
    { string: 2, fretOffset: 0, finger: 0, isRoot: false }, // Open
    { string: 1, fretOffset: 0, finger: 0, isRoot: true }, // Root (Open)
  ]
};

const SHAPE_D: CagedShape = {
  name: ShapeName.D,
  baseRootNoteIndex: 2, // Open D is D
  positions: [
    { string: 4, fretOffset: 0, finger: 0, isRoot: true }, // Root (Open)
    { string: 3, fretOffset: 2, finger: 1, isRoot: false }, // Index
    { string: 2, fretOffset: 3, finger: 3, isRoot: false }, // Ring
    { string: 1, fretOffset: 2, finger: 2, isRoot: false }, // Middle
  ]
};

export const SHAPES = [SHAPE_C, SHAPE_A, SHAPE_G, SHAPE_E, SHAPE_D];

// Special Handling: Open C Major is already correct in SHAPE_C definition above
// (3-2-0-1-0). But if we want to enforce it explicitly or have variations:
export const OPEN_C_FINGERING: FingerPosition[] = [
    { string: 5, fretOffset: 3, finger: 3, isRoot: true },
    { string: 4, fretOffset: 2, finger: 2, isRoot: false },
    { string: 3, fretOffset: 0, finger: 0, isRoot: false },
    { string: 2, fretOffset: 1, finger: 1, isRoot: false },
    { string: 1, fretOffset: 0, finger: 0, isRoot: false },
];

export const getNoteFrequency = (stringIndex: number, fret: number) => {
  // stringIndex 0 = high E (array logic), but standard is 1=high E.
  // We use 0-5 for array indexing where 0 is high E.
  const openFreq = STRING_OPEN_FREQUENCIES[stringIndex];
  return openFreq * Math.pow(2, fret / 12);
};