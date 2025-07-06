import { ChordDiagram as ChordDiagramType } from "@/lib/chord-utils";

interface ChordDiagramProps {
  chord: ChordDiagramType;
  className?: string;
}

export function ChordDiagram({ chord, className = "" }: ChordDiagramProps) {
  const stringSpacing = 16; // pixels between strings
  const fretHeight = 20; // pixels between frets
  const numFrets = 4; // show 4 frets
  
  // Find the minimum fret to determine starting position
  const minFret = Math.min(
    ...chord.frets
      .filter(f => f !== 'x' && f !== '0')
      .map(f => parseInt(f))
      .filter(f => !isNaN(f))
  );
  const startFret = minFret > 3 ? minFret : 1;
  
  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-4 shadow-lg ${className}`}>
      <div className="text-center mb-3">
        <h3 className="font-bold text-gray-800 text-sm">{chord.name}</h3>
      </div>
      
      <div className="relative mx-auto" style={{ width: '100px', height: '100px' }}>
        {/* Fret position indicator */}
        {startFret > 1 && (
          <div className="absolute -left-6 top-2 text-xs text-gray-600 font-medium">
            {startFret}fr
          </div>
        )}
        
        {/* Nut (if starting from 1st fret) */}
        {startFret === 1 && (
          <div 
            className="absolute bg-gray-800" 
            style={{ 
              left: '10px', 
              right: '10px', 
              top: '10px', 
              height: '3px' 
            }} 
          />
        )}
        
        {/* Fret lines */}
        {Array.from({ length: numFrets + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute bg-gray-400"
            style={{
              left: '10px',
              right: '10px',
              top: `${10 + i * fretHeight}px`,
              height: i === 0 && startFret === 1 ? '3px' : '1px',
            }}
          />
        ))}
        
        {/* String lines */}
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="absolute bg-gray-400"
            style={{
              left: `${10 + i * stringSpacing}px`,
              width: '1px',
              top: '10px',
              bottom: '10px',
            }}
          />
        ))}
        
        {/* Finger positions and open/muted indicators */}
        {chord.frets.map((fret, stringIndex) => {
          const x = 10 + stringIndex * stringSpacing;
          
          if (fret === 'x') {
            // Muted string
            return (
              <div
                key={stringIndex}
                className="absolute text-red-600 font-bold text-xs"
                style={{
                  left: `${x - 4}px`,
                  top: '-5px',
                }}
              >
                ✕
              </div>
            );
          } else if (fret === '0') {
            // Open string
            return (
              <div
                key={stringIndex}
                className="absolute w-3 h-3 border-2 border-gray-700 rounded-full bg-white"
                style={{
                  left: `${x - 6}px`,
                  top: '-5px',
                }}
              />
            );
          } else {
            // Fretted note
            const fretNum = parseInt(fret);
            const adjustedFret = fretNum - startFret + 1;
            const y = 10 + (adjustedFret - 0.5) * fretHeight;
            
            return (
              <div
                key={stringIndex}
                className="absolute w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center"
                style={{
                  left: `${x - 8}px`,
                  top: `${y - 8}px`,
                }}
              >
                <span className="text-white text-xs font-medium">
                  {chord.fingers[stringIndex] || ''}
                </span>
              </div>
            );
          }
        })}
        
        {/* Barres */}
        {chord.barres?.map((barre, index) => {
          const adjustedFret = barre.fret - startFret + 1;
          const y = 10 + (adjustedFret - 0.5) * fretHeight;
          const leftX = 10 + (barre.fromString - 1) * stringSpacing;
          const rightX = 10 + (barre.toString - 1) * stringSpacing;
          
          return (
            <div
              key={index}
              className="absolute bg-gray-800 rounded-full"
              style={{
                left: `${leftX - 8}px`,
                width: `${rightX - leftX + 16}px`,
                top: `${y - 2}px`,
                height: '4px',
              }}
            />
          );
        })}
      </div>
      
      {/* String names */}
      <div className="flex justify-center mt-2 text-xs text-gray-600" style={{ gap: '11px' }}>
        <span>E</span>
        <span>A</span>
        <span>D</span>
        <span>G</span>
        <span>B</span>
        <span>E</span>
      </div>
    </div>
  );
}