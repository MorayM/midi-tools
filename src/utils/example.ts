/**
 * Example utility function for testing
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Example utility function that formats a MIDI note number
 */
export function formatMidiNote(note: number): string {
  if (note < 0 || note > 127) {
    throw new Error('MIDI note must be between 0 and 127');
  }
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(note / 12) - 1;
  const noteName = notes[note % 12];
  return `${noteName}${octave}`;
}

