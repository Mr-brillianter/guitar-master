import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NOTES, SHAPES, OPEN_C_FINGERING } from './constants';
import { NoteName, ChordInstance } from './types';
import { audioEngine } from './audioService';
import Fretboard from './components/Fretboard';
import { Play, Pause, StepForward, Info } from 'lucide-react';

const App: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<NoteName>(NoteName.C);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generatedChords, setGeneratedChords] = useState<ChordInstance[]>([]);
  const [tempo, setTempo] = useState(2000); // ms

  const timerRef = useRef<number | null>(null);

  // Logic to generate chords for the selected key
  const generateChordsForKey = useCallback((key: NoteName) => {
    const keyIndex = NOTES.indexOf(key);
    
    // Calculate positions for all 5 shapes
    const chords: ChordInstance[] = SHAPES.map(shape => {
      // Calculate fret shift needed
      // Logic: (TargetKeyIndex - ShapeRootIndex + 12) % 12 = Capo Position
      const shift = (keyIndex - shape.baseRootNoteIndex + 12) % 12;
      
      const isMovable = shift > 0;
      let notes = shape.positions.map(pos => {
        return {
          string: pos.string,
          fret: pos.fretOffset + shift,
          isRoot: pos.isRoot,
          finger: pos.finger
        };
      });

      // Finger Logic Correction
      if (!isMovable && shape.name === 'C') {
         // Explicitly use standard Open C fingering if needed, 
         // though constants are now correct.
         notes = OPEN_C_FINGERING.map(pos => ({
             ...pos,
             fret: pos.fretOffset
         }));
      } else if (isMovable) {
          // Adjust fingers for barre/movable shapes
          // Logic: 
          // 1. If original finger was 0 (Open), it must now be barred by Index (1).
          // 2. If original finger was > 0, it shifts up by one (1->2, 2->3, 3->4).
          
          notes = notes.map(n => {
              // We need to look at the ORIGINAL finger from the shape definition
              // since 'n.finger' is currently just copied from it.
              
              let newFinger = n.finger;

              if (n.finger === 0) {
                  // Original was open, now barred by Index
                  newFinger = 1; 
              } else {
                  // Original was fretted, shift finger up
                  // 1(Index) -> 2(Middle)
                  // 2(Middle) -> 3(Ring)
                  // 3(Ring) -> 4(Pinky)
                  // 4(Pinky) -> 4(Pinky) - (Rare case, usually G shape stretch, simply cap at 4)
                  newFinger = Math.min(4, n.finger + 1);
              }
              
              return { ...n, finger: newFinger };
          });
      }

      return {
        shapeName: shape.name,
        fretPosition: shift,
        actualRootNote: key,
        notes
      };
    });

    // Smart Sort: Sort by the lowest fret used in the chord
    const sortedChords = chords.sort((a, b) => {
        // Calculate effective 'weight' of position. 
        // We prefer lower positions, but if fret is 0, it's very low.
        return a.fretPosition - b.fretPosition;
    });

    setGeneratedChords(sortedChords);
    setCurrentIndex(0);
  }, []);

  // Play functionality
  const playCurrentChord = () => {
    if (generatedChords.length === 0) return;
    const chord = generatedChords[currentIndex];
    audioEngine.strumChord(chord.notes);
  };

  useEffect(() => {
    generateChordsForKey(selectedKey);
  }, [selectedKey, generateChordsForKey]);

  useEffect(() => {
    if (isPlaying) {
      playCurrentChord(); // Play immediately on start
      timerRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => {
            const next = (prev + 1) % generatedChords.length;
            return next;
        });
      }, tempo);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, tempo, generatedChords.length]);

  // Trigger sound when index changes while playing
  useEffect(() => {
      if (isPlaying) {
          playCurrentChord();
      }
  }, [currentIndex]);


  const handleNext = () => {
      const next = (currentIndex + 1) % generatedChords.length;
      setCurrentIndex(next);
      if(!isPlaying) {
          // Manually play sound
          const chord = generatedChords[next];
          audioEngine.strumChord(chord.notes);
      }
  };

  const handlePrev = () => {
    const next = (currentIndex - 1 + generatedChords.length) % generatedChords.length;
    setCurrentIndex(next);
     if(!isPlaying) {
          // Manually play sound
          const chord = generatedChords[next];
          audioEngine.strumChord(chord.notes);
      }
  };

  const currentChord = generatedChords[currentIndex];

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center">
      
      {/* Header */}
      <header className="mb-10 text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-400 tracking-tight">
          CAGED 吉他大师
        </h1>
        <p className="text-slate-400 font-medium">全调式和弦循环练习</p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl grid gap-8">
        
        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          
          <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">选择调式</label>
              <div className="flex flex-wrap gap-2">
                {NOTES.map(note => (
                    <button
                        key={note}
                        onClick={() => {
                            setSelectedKey(note);
                            setIsPlaying(false);
                        }}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                            selectedKey === note 
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 scale-110' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        {note}
                    </button>
                ))}
              </div>
          </div>

          <div className="flex items-center gap-4">
               <button
                  onClick={handlePrev}
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
               >
                 <StepForward className="rotate-180 w-5 h-5" />
               </button>

               <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
                      isPlaying 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-500/30'
                  }`}
               >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
               </button>

               <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
               >
                 <StepForward className="w-5 h-5" />
               </button>
          </div>

          <div className="flex flex-col gap-2 min-w-[140px]">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">速度 (ms)</label>
             <input 
                type="range" 
                min="500" 
                max="4000" 
                step="100"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
             />
             <div className="text-right text-xs text-slate-400">{(tempo/1000).toFixed(1)}s</div>
          </div>

        </div>

        {/* Display Info */}
        {currentChord && (
             <div className="flex flex-col items-center animate-fadeIn">
                 <div className="flex items-baseline gap-3 mb-6">
                     <span className="text-6xl font-black text-slate-100">{currentChord.actualRootNote}</span>
                     <span className="text-2xl font-light text-slate-400">大调</span>
                     <span className="px-4 py-1 rounded-full bg-slate-700 text-cyan-300 font-mono text-lg border border-slate-600">
                         {currentChord.shapeName}-型
                     </span>
                     <span className="text-slate-500 font-mono">
                         把位: {currentChord.fretPosition === 0 ? '空弦' : currentChord.fretPosition}
                     </span>
                 </div>

                 <Fretboard chord={currentChord} lang="zh" />
             </div>
        )}

        {/* Tips / Notes */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg flex items-start gap-3 max-w-2xl mx-auto">
             <Info className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
             <div className="space-y-2 text-sm text-slate-300">
                 <p>
                     <span className="font-bold text-slate-200">指法提示：</span> 
                     当和弦为“移动把位”（Movable Shape）时，
                     <span className="text-amber-400 font-bold mx-1">1</span> (食指) 始终负责大横按（模拟琴枕）。
                     原有的按弦手指顺延：食指变为 <span className="text-amber-400 font-bold">2</span> (中指)，
                     中指变为 <span className="text-amber-400 font-bold">3</span> (无名指)，
                     无名指变为 <span className="text-amber-400 font-bold">4</span> (小指)。
                 </p>
                 <p>
                     <span className="font-bold text-slate-200">注意：</span> 
                     这里展示的是同一大调和弦在指板上不同位置的 CAGED 转位系统。
                 </p>
             </div>
        </div>

      </main>
    </div>
  );
};

export default App;