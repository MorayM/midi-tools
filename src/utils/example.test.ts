import { add, formatMidiNote } from './example';

describe('example utility functions', () => {
  describe('add', () => {
    it('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
    });
  });

  describe('formatMidiNote', () => {
    it('should format MIDI note numbers correctly', () => {
      expect(formatMidiNote(60)).toBe('C4'); // Middle C
      expect(formatMidiNote(69)).toBe('A4'); // A440
      expect(formatMidiNote(0)).toBe('C-1');
      expect(formatMidiNote(127)).toBe('G9');
    });

    it('should throw error for invalid MIDI note numbers', () => {
      expect(() => formatMidiNote(-1)).toThrow('MIDI note must be between 0 and 127');
      expect(() => formatMidiNote(128)).toThrow('MIDI note must be between 0 and 127');
    });
  });
});

