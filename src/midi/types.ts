/**
 * MIDI channel type (0-15)
 */
export type MidiChannel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

/**
 * MIDI note number (0-127)
 */
export type MidiNote = number; // 0-127

/**
 * MIDI velocity (0-127)
 */
export type MidiVelocity = number; // 0-127

/**
 * MIDI controller number (0-127)
 */
export type MidiController = number; // 0-127

/**
 * MIDI controller value (0-127)
 */
export type MidiControllerValue = number; // 0-127

/**
 * MIDI program number (0-127)
 */
export type MidiProgram = number; // 0-127

/**
 * MIDI bank number (0-16383)
 */
export type MidiBank = number; // 0-16383

/**
 * Pitch bend value (-8192 to 8191)
 */
export type PitchBendValue = number; // -8192 to 8191

/**
 * MIDI device information
 */
export interface MidiDeviceInfo {
  id: string;
  name: string;
  manufacturer?: string;
  state: 'connected' | 'disconnected';
}

