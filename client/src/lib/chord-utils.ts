// Chord transposition and diagram utilities

export interface ChordDiagram {
  name: string;
  frets: string[];
  fingers: string[];
  barres?: { fret: number; fromString: number; toString: number }[];
}

// Music theory constants
const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Common chord patterns for guitar
const CHORD_DIAGRAMS: { [key: string]: ChordDiagram } = {
  // Major chords
  'C': { name: 'C', frets: ['x', '3', '2', '0', '1', '0'], fingers: ['', '3', '2', '', '1', ''] },
  'D': { name: 'D', frets: ['x', 'x', '0', '2', '3', '2'], fingers: ['', '', '', '1', '3', '2'] },
  'E': { name: 'E', frets: ['0', '2', '2', '1', '0', '0'], fingers: ['', '2', '3', '1', '', ''] },
  'F': { name: 'F', frets: ['1', '3', '3', '2', '1', '1'], fingers: ['1', '3', '4', '2', '1', '1'], barres: [{ fret: 1, fromString: 1, toString: 6 }] },
  'G': { name: 'G', frets: ['3', '2', '0', '0', '3', '3'], fingers: ['3', '1', '', '', '4', '4'] },
  'A': { name: 'A', frets: ['x', '0', '2', '2', '2', '0'], fingers: ['', '', '1', '2', '3', ''] },
  'B': { name: 'B', frets: ['x', '2', '4', '4', '4', '2'], fingers: ['', '1', '2', '3', '4', '1'], barres: [{ fret: 2, fromString: 2, toString: 5 }] },
  
  // Minor chords
  'Am': { name: 'Am', frets: ['x', '0', '2', '2', '1', '0'], fingers: ['', '', '2', '3', '1', ''] },
  'Dm': { name: 'Dm', frets: ['x', 'x', '0', '2', '3', '1'], fingers: ['', '', '', '1', '3', '2'] },
  'Em': { name: 'Em', frets: ['0', '2', '2', '0', '0', '0'], fingers: ['', '1', '2', '', '', ''] },
  'Fm': { name: 'Fm', frets: ['1', '3', '3', '1', '1', '1'], fingers: ['1', '3', '4', '1', '1', '1'], barres: [{ fret: 1, fromString: 1, toString: 6 }] },
  'Gm': { name: 'Gm', frets: ['3', '5', '5', '3', '3', '3'], fingers: ['1', '3', '4', '1', '1', '1'], barres: [{ fret: 3, fromString: 3, toString: 6 }] },
  'Bm': { name: 'Bm', frets: ['x', '2', '4', '4', '3', '2'], fingers: ['', '1', '3', '4', '2', '1'], barres: [{ fret: 2, fromString: 2, toString: 5 }] },
  'Cm': { name: 'Cm', frets: ['x', '3', '5', '5', '4', '3'], fingers: ['', '1', '3', '4', '2', '1'], barres: [{ fret: 3, fromString: 2, toString: 5 }] },
  
  // 7th chords
  'C7': { name: 'C7', frets: ['x', '3', '2', '3', '1', '0'], fingers: ['', '3', '2', '4', '1', ''] },
  'D7': { name: 'D7', frets: ['x', 'x', '0', '2', '1', '2'], fingers: ['', '', '', '2', '1', '3'] },
  'E7': { name: 'E7', frets: ['0', '2', '0', '1', '0', '0'], fingers: ['', '2', '', '1', '', ''] },
  'F7': { name: 'F7', frets: ['1', '3', '1', '2', '1', '1'], fingers: ['1', '3', '1', '2', '1', '1'], barres: [{ fret: 1, fromString: 1, toString: 6 }] },
  'G7': { name: 'G7', frets: ['3', '2', '0', '0', '0', '1'], fingers: ['3', '2', '', '', '', '1'] },
  'A7': { name: 'A7', frets: ['x', '0', '2', '0', '2', '0'], fingers: ['', '', '1', '', '2', ''] },
  'B7': { name: 'B7', frets: ['x', '2', '1', '2', '0', '2'], fingers: ['', '2', '1', '3', '', '4'] },
};

// Detect chords in text using regex patterns
export function detectChords(text: string): { chord: string; position: number }[] {
  const chordPattern = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[69]|[0-9]+)?)\b/g;
  const matches: { chord: string; position: number }[] = [];
  let match;
  
  // Split text into lines to analyze context
  const lines = text.split('\n');
  let currentPosition = 0;
  
  lines.forEach((line, lineIndex) => {
    // Skip lines that look like tablature (contain multiple numbers and dashes)
    const isTablatureLine = /^[a-gA-G]?\|?[-0-9xX\|]{10,}/.test(line.trim());
    const isStringTuning = /^[EADGBE\s\|:]+$/.test(line.trim());
    const isFretboardLine = /^[-\|]{5,}/.test(line.trim());
    
    if (!isTablatureLine && !isStringTuning && !isFretboardLine) {
      // Only detect chords in lyrics/chord lines
      let lineMatch;
      const linePattern = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[69]|[0-9]+)?)\b/g;
      
      while ((lineMatch = linePattern.exec(line)) !== null) {
        matches.push({
          chord: lineMatch[1],
          position: currentPosition + lineMatch.index
        });
      }
    }
    
    currentPosition += line.length + 1; // +1 for newline character
  });
  
  return matches;
}

// Transpose a single chord
export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;
  
  // Extract root note and chord type
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  
  const [, root, suffix] = match;
  
  // Find current note in chromatic scale
  let noteIndex = CHROMATIC_SCALE.indexOf(root);
  if (noteIndex === -1) {
    // Try flat notation
    noteIndex = FLAT_SCALE.indexOf(root);
    if (noteIndex === -1) return chord;
  }
  
  // Calculate new note index
  let newIndex = (noteIndex + semitones) % 12;
  if (newIndex < 0) newIndex += 12;
  
  // Use appropriate scale based on direction and preference
  const newRoot = semitones > 0 ? CHROMATIC_SCALE[newIndex] : FLAT_SCALE[newIndex];
  
  return newRoot + suffix;
}

// Transpose all chords in text
export function transposeText(text: string, semitones: number): string {
  if (semitones === 0) return text;
  
  // Split text into lines and only transpose chord lines
  const lines = text.split('\n');
  
  return lines.map(line => {
    // Skip lines that look like tablature (contain multiple numbers and dashes)
    const isTablatureLine = /^[a-gA-G]?\|?[-0-9xX\|]{10,}/.test(line.trim());
    const isStringTuning = /^[EADGBE\s\|:]+$/.test(line.trim());
    const isFretboardLine = /^[-\|]{5,}/.test(line.trim());
    
    if (isTablatureLine || isStringTuning || isFretboardLine) {
      // Don't transpose tablature lines, string tuning, or fretboard lines
      return line;
    }
    
    // Transpose chords in lyrics/chord lines only
    const chordPattern = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[69]|[0-9]+)?)\b/g;
    return line.replace(chordPattern, (match) => {
      return transposeChord(match, semitones);
    });
  }).join('\n');
}

// Get chord diagram for a chord
export function getChordDiagram(chordName: string): ChordDiagram | null {
  // First try exact match
  if (CHORD_DIAGRAMS[chordName]) {
    return CHORD_DIAGRAMS[chordName];
  }
  
  // Try to find base chord without modifications
  const baseChord = chordName.match(/^([A-G][#b]?(?:m)?)/)?.[1];
  if (baseChord && CHORD_DIAGRAMS[baseChord]) {
    return { ...CHORD_DIAGRAMS[baseChord], name: chordName };
  }
  
  return null;
}

// Format fret notation for display
export function formatFret(fret: string): string {
  if (fret === 'x') return '✕';
  if (fret === '0') return '○';
  return fret;
}