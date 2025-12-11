import React, { useMemo } from 'react';
import { ChordInstance } from '../types';
import clsx from 'clsx';

interface FretboardProps {
  chord: ChordInstance;
  showNotes?: boolean;
  lang?: 'en' | 'zh';
}

// 0 is open, 1-15 frets
const TOTAL_FRETS = 15;

const Fretboard: React.FC<FretboardProps> = ({ chord, lang = 'en' }) => {
  // Determine visible range. We want to center the view around the chord, 
  // but always show at least frets 0-3 if it's an open chord.
  // If the chord is high up (e.g., fret 10), show 7-13.
  
  const minFret = Math.min(...chord.notes.map(n => n.fret));
  const maxFret = Math.max(...chord.notes.map(n => n.fret));
  
  let startFret = Math.max(0, minFret - 1);
  const endFret = Math.min(TOTAL_FRETS, Math.max(startFret + 5, maxFret + 1));
  
  // Adjust if chord is open (contains fret 0)
  if (minFret === 0) {
    startFret = 0;
  }

  // Generate an array of visible frets
  const visibleFrets = useMemo(() => {
    const frets = [];
    for (let i = startFret; i <= endFret; i++) {
      frets.push(i);
    }
    return frets;
  }, [startFret, endFret]);

  const isDotFret = (fret: number) => [3, 5, 7, 9, 12, 15].includes(fret);
  const isDoubleDot = (fret: number) => fret === 12;

  const textOpen = lang === 'zh' ? '空弦' : 'Open';
  const textFooter = lang === 'zh' 
    ? '圆点内的数字代表推荐指法 (1=食指, 4=小指)。'
    : 'Numbers inside dots indicate recommended fingering (1=Index, 4=Pinky).';

  return (
    <div className="w-full max-w-3xl mx-auto overflow-hidden bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-4">
      <div className="relative">
        {/* Nut (only if fret 0 is visible) */}
        {startFret === 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-yellow-100/20 border-r-4 border-yellow-200 z-10"></div>
        )}

        {/* Strings */}
        <div className="flex flex-col justify-between h-48 py-4 relative z-0">
          {[1, 2, 3, 4, 5, 6].map((stringNum) => (
            <div 
              key={stringNum} 
              className="w-full relative"
              style={{ height: '1px' }}
            >
              <div 
                className={clsx(
                  "absolute w-full bg-slate-400 shadow-sm",
                  stringNum >= 4 ? "h-[2px]" : "h-[1px]" // Thicker low strings
                )}
              ></div>
            </div>
          ))}
        </div>

        {/* Frets Grid */}
        <div className="absolute inset-0 flex pl-2">
            {visibleFrets.map((fret) => (
                <div key={fret} className="flex-1 border-r border-slate-500 relative h-full flex items-center justify-center">
                    {/* Fret Markers */}
                    {isDotFret(fret) && fret > 0 && (
                        <div className="absolute flex flex-col gap-8 opacity-40">
                             {isDoubleDot(fret) ? (
                                 <>
                                    <div className="w-4 h-4 rounded-full bg-slate-200/50 -translate-y-6"></div>
                                    <div className="w-4 h-4 rounded-full bg-slate-200/50 translate-y-6"></div>
                                 </>
                             ) : (
                                <div className="w-4 h-4 rounded-full bg-slate-200/50"></div>
                             )}
                        </div>
                    )}
                    
                    {/* Fret Number Label */}
                    <span className="absolute -bottom-6 text-xs text-slate-500 font-mono">
                        {fret}
                    </span>
                </div>
            ))}
        </div>

        {/* Note Markers */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 pl-2">
           {[1, 2, 3, 4, 5, 6].map((stringNum) => {
               // Find if there is a note on this string
               const note = chord.notes.find(n => n.string === stringNum);
               
               return (
                   <div key={stringNum} className="relative w-full h-4 flex items-center">
                       {note && visibleFrets.includes(note.fret) && (
                           <div 
                                className="absolute z-20 flex items-center justify-center transition-all duration-300"
                                style={{
                                    left: `${((visibleFrets.indexOf(note.fret) + 0.5) / visibleFrets.length) * 100}%`,
                                    transform: 'translateX(-50%)'
                                }}
                           >
                               <div className={clsx(
                                   "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2",
                                   note.isRoot 
                                     ? "bg-amber-500 border-amber-300 text-white" 
                                     : "bg-cyan-600 border-cyan-400 text-white"
                               )}>
                                   {note.finger === 0 ? '' : note.finger}
                               </div>
                               {note.fret === 0 && (
                                   <div className="absolute -top-6 text-xs text-slate-400">{textOpen}</div>
                               )}
                           </div>
                       )}
                   </div>
               )
           })}
        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-xs">
          {textFooter}
      </div>
    </div>
  );
};

export default Fretboard;