import { ChordDiagram as ChordDiagramType, formatFret } from "@/lib/chord-utils";

interface ChordDiagramProps {
  chord: ChordDiagramType;
  className?: string;
}

export function ChordDiagram({ chord, className = "" }: ChordDiagramProps) {
  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-3 shadow-lg ${className}`}>
      <div className="text-center mb-2">
        <h3 className="font-bold text-gray-800 text-lg">{chord.name}</h3>
      </div>
      
      {/* Fretboard */}
      <div className="relative">
        {/* String lines */}
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, fret) => (
            <div key={fret} className="h-px bg-gray-400 w-20 mx-auto" />
          ))}
        </div>
        
        {/* Fret lines */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {Array.from({ length: 6 }, (_, string) => (
            <div key={string} className="w-px bg-gray-400 h-10" />
          ))}
        </div>
        
        {/* Finger positions */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
          <div className="flex space-x-3">
            {chord.frets.map((fret, string) => (
              <div key={string} className="w-px relative flex flex-col items-center">
                {fret === 'x' ? (
                  <div className="text-red-500 font-bold text-sm -mt-1">✕</div>
                ) : fret === '0' ? (
                  <div className="w-3 h-3 border-2 border-gray-600 rounded-full bg-white -mt-2" />
                ) : (
                  <div 
                    className="w-3 h-3 bg-gray-800 rounded-full text-white text-xs flex items-center justify-center"
                    style={{ 
                      marginTop: `${(parseInt(fret) - 1) * 8 + 3}px` 
                    }}
                  >
                    {chord.fingers[string] || ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Barres */}
        {chord.barres?.map((barre, index) => (
          <div
            key={index}
            className="absolute bg-gray-800 rounded-full h-2"
            style={{
              top: `${(barre.fret - 1) * 8 + 7}px`,
              left: `${((6 - barre.toString) * 12) + 6}px`,
              width: `${((barre.toString - barre.fromString) * 12) + 12}px`,
            }}
          />
        ))}
      </div>
      
      {/* String names */}
      <div className="flex justify-center space-x-3 mt-2 text-xs text-gray-600">
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