import { useState, useEffect, useRef } from 'react';
import { sendNoteOn, sendNoteOff } from '../midi/messageSender';
import './PianoKeyboard.css';

interface PianoKeyboardProps {
  output: MIDIOutput | null;
  channel: number;
}

interface KeyInfo {
  note: number;
  isBlack: boolean;
  label: string;
}

export function PianoKeyboard({ output, channel }: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const [keyWidth, setKeyWidth] = useState(40);

  // Generate keys for 2 octaves: C3 (48) to C5 (72), with middle C (60) centered
  const generateKeys = (): KeyInfo[] => {
    const keys: KeyInfo[] = [];
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Generate notes from C3 (48) to C5 (72) - 2 octaves
    for (let note = 48; note <= 72; note++) {
      const octave = Math.floor(note / 12) - 1;
      const noteIndex = note % 12;
      const isBlack = noteNames[noteIndex].includes('#');
      const label = `${noteNames[noteIndex]}${octave}`;
      
      keys.push({ note, isBlack, label });
    }
    
    return keys;
  };

  const keys = generateKeys();

  // Calculate key width based on container width
  useEffect(() => {
    const updateKeyWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const whiteKeyCount = keys.filter((k) => !k.isBlack).length;
        const calculatedWidth = containerWidth / whiteKeyCount;
        setKeyWidth(Math.max(40, calculatedWidth));
      }
    };

    updateKeyWidth();
    window.addEventListener('resize', updateKeyWidth);
    return () => window.removeEventListener('resize', updateKeyWidth);
  }, [keys.length]);

  const handleMouseDown = (note: number) => {
    if (!output) return;
    
    setPressedKeys((prev) => new Set(prev).add(note));
    sendNoteOn(output, channel, note, 100);
  };

  const handleMouseUp = (note: number) => {
    if (!output) return;
    
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    sendNoteOff(output, channel, note, 0);
  };

  const handleMouseLeave = () => {
    // Release all keys when mouse leaves keyboard
    if (!output) return;
    
    pressedKeys.forEach((note) => {
      sendNoteOff(output, channel, note, 0);
    });
    setPressedKeys(new Set());
  };

  const whiteKeys = keys.filter((k) => !k.isBlack);
  const blackKeys = keys.filter((k) => k.isBlack);

  return (
    <div
      ref={containerRef}
      className="piano-keyboard"
      onMouseLeave={handleMouseLeave}
    >
      <div className="piano-keys-container">
        {whiteKeys.map((key) => (
          <div
            key={key.note}
            className={`piano-key white-key ${pressedKeys.has(key.note) ? 'pressed' : ''}`}
            style={{ width: `${keyWidth}px` }}
            onMouseDown={() => handleMouseDown(key.note)}
            onMouseUp={() => handleMouseUp(key.note)}
          >
            <span className="key-label">{key.label}</span>
          </div>
        ))}
        {blackKeys.map((key) => {
          // Calculate position of black key relative to white keys
          // Find how many white keys come before this black key
          const whiteKeysBefore = whiteKeys.filter((w) => w.note < key.note).length;
          const left = whiteKeysBefore * keyWidth - (keyWidth * 0.3);
          
          return (
            <div
              key={key.note}
              className={`piano-key black-key ${pressedKeys.has(key.note) ? 'pressed' : ''}`}
              style={{
                left: `${left}px`,
                width: `${keyWidth * 0.6}px`,
              }}
              onMouseDown={() => handleMouseDown(key.note)}
              onMouseUp={() => handleMouseUp(key.note)}
            >
              <span className="key-label">{key.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

