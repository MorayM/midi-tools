import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  sendNoteOn,
  sendNoteOff,
  sendControlChange,
  sendPitchBend,
  sendProgramChange,
  sendBankSelect,
} from './messageSender';
import { createMockMidiOutput } from './__mocks__/midiMocks';

describe('messageSender', () => {
  let mockOutput: ReturnType<typeof createMockMidiOutput>;

  beforeEach(() => {
    mockOutput = createMockMidiOutput('device1', 'Test Device');
  });

  describe('sendNoteOn', () => {
    it('should send correct Note On message', () => {
      sendNoteOn(mockOutput as unknown as MIDIOutput, 0, 60, 100);
      
      expect(mockOutput.send).toHaveBeenCalledTimes(1);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0x90, 60, 100]));
    });

    it('should handle different channels', () => {
      sendNoteOn(mockOutput as unknown as MIDIOutput, 15, 60, 100);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data[0]).toBe(0x9f); // 0x90 | 15
    });

    it('should include timestamp when provided', () => {
      sendNoteOn(mockOutput as unknown as MIDIOutput, 0, 60, 100, 1000);
      expect(mockOutput.send).toHaveBeenCalledWith(expect.any(Uint8Array), 1000);
    });

    it('should throw error for invalid channel', () => {
      expect(() => sendNoteOn(mockOutput as unknown as MIDIOutput, -1, 60, 100)).toThrow('Invalid MIDI channel');
      expect(() => sendNoteOn(mockOutput as unknown as MIDIOutput, 16, 60, 100)).toThrow('Invalid MIDI channel');
    });

    it('should throw error for invalid note', () => {
      expect(() => sendNoteOn(mockOutput as unknown as MIDIOutput, 0, -1, 100)).toThrow('Invalid note');
      expect(() => sendNoteOn(mockOutput as unknown as MIDIOutput, 0, 128, 100)).toThrow('Invalid note');
    });

    it('should throw error for invalid velocity', () => {
      expect(() => sendNoteOn(mockOutput as unknown as MIDIOutput, 0, 60, -1)).toThrow('Invalid velocity');
      expect(() => sendNoteOn(mockOutput as unknown as MIDIOutput, 0, 60, 128)).toThrow('Invalid velocity');
    });
  });

  describe('sendNoteOff', () => {
    it('should send correct Note Off message', () => {
      sendNoteOff(mockOutput as unknown as MIDIOutput, 0, 60, 0);
      
      expect(mockOutput.send).toHaveBeenCalledTimes(1);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0x80, 60, 0]));
    });

    it('should default velocity to 0', () => {
      sendNoteOff(mockOutput as unknown as MIDIOutput, 0, 60);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0x80, 60, 0]));
    });

    it('should handle custom velocity', () => {
      sendNoteOff(mockOutput as unknown as MIDIOutput, 0, 60, 64);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0x80, 60, 64]));
    });

    it('should handle different channels', () => {
      sendNoteOff(mockOutput as unknown as MIDIOutput, 9, 60, 0);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data[0]).toBe(0x89); // 0x80 | 9
    });

    it('should throw error for invalid parameters', () => {
      expect(() => sendNoteOff(mockOutput as unknown as MIDIOutput, 16, 60, 0)).toThrow('Invalid MIDI channel');
      expect(() => sendNoteOff(mockOutput as unknown as MIDIOutput, 0, 128, 0)).toThrow('Invalid note');
    });
  });

  describe('sendControlChange', () => {
    it('should send correct Control Change message', () => {
      sendControlChange(mockOutput as unknown as MIDIOutput, 0, 1, 64);
      
      expect(mockOutput.send).toHaveBeenCalledTimes(1);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0xb0, 1, 64]));
    });

    it('should handle different channels', () => {
      sendControlChange(mockOutput as unknown as MIDIOutput, 5, 1, 64);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data[0]).toBe(0xb5); // 0xB0 | 5
    });

    it('should handle all valid controller and value ranges', () => {
      sendControlChange(mockOutput as unknown as MIDIOutput, 0, 0, 0);
      let [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0xb0, 0, 0]));

      sendControlChange(mockOutput as unknown as MIDIOutput, 0, 127, 127);
      [data] = mockOutput.send.mock.calls[1];
      expect(data).toEqual(new Uint8Array([0xb0, 127, 127]));
    });

    it('should throw error for invalid parameters', () => {
      expect(() => sendControlChange(mockOutput as unknown as MIDIOutput, 16, 1, 64)).toThrow('Invalid MIDI channel');
      expect(() => sendControlChange(mockOutput as unknown as MIDIOutput, 0, 128, 64)).toThrow('Invalid controller');
      expect(() => sendControlChange(mockOutput as unknown as MIDIOutput, 0, 1, 128)).toThrow('Invalid value');
    });
  });

  describe('sendPitchBend', () => {
    it('should send correct Pitch Bend message at center', () => {
      sendPitchBend(mockOutput as unknown as MIDIOutput, 0, 0);
      
      expect(mockOutput.send).toHaveBeenCalledTimes(1);
      const [data] = mockOutput.send.mock.calls[0];
      // 0 + 8192 = 8192 = 0x2000 = LSB: 0x00, MSB: 0x40
      expect(data).toEqual(new Uint8Array([0xe0, 0x00, 0x40]));
    });

    it('should send correct Pitch Bend message at maximum down', () => {
      sendPitchBend(mockOutput as unknown as MIDIOutput, 0, -8192);
      const [data] = mockOutput.send.mock.calls[0];
      // -8192 + 8192 = 0 = LSB: 0x00, MSB: 0x00
      expect(data).toEqual(new Uint8Array([0xe0, 0x00, 0x00]));
    });

    it('should send correct Pitch Bend message at maximum up', () => {
      sendPitchBend(mockOutput as unknown as MIDIOutput, 0, 8191);
      const [data] = mockOutput.send.mock.calls[0];
      // 8191 + 8192 = 16383 = 0x3FFF = LSB: 0x7F, MSB: 0x7F
      expect(data).toEqual(new Uint8Array([0xe0, 0x7f, 0x7f]));
    });

    it('should handle different channels', () => {
      sendPitchBend(mockOutput as unknown as MIDIOutput, 10, 0);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data[0]).toBe(0xea); // 0xE0 | 10
    });

    it('should correctly convert pitch bend values to 14-bit', () => {
      // Test a few specific values
      sendPitchBend(mockOutput as unknown as MIDIOutput, 0, 4096);
      let [data] = mockOutput.send.mock.calls[0];
      // 4096 + 8192 = 12288 = 0x3000 = LSB: 0x00, MSB: 0x60
      expect(data).toEqual(new Uint8Array([0xe0, 0x00, 0x60]));

      sendPitchBend(mockOutput as unknown as MIDIOutput, 0, -4096);
      [data] = mockOutput.send.mock.calls[1];
      // -4096 + 8192 = 4096 = 0x1000 = LSB: 0x00, MSB: 0x20
      expect(data).toEqual(new Uint8Array([0xe0, 0x00, 0x20]));
    });

    it('should throw error for invalid pitch bend value', () => {
      expect(() => sendPitchBend(mockOutput as unknown as MIDIOutput, 0, -8193)).toThrow('Invalid pitch bend value');
      expect(() => sendPitchBend(mockOutput as unknown as MIDIOutput, 0, 8192)).toThrow('Invalid pitch bend value');
    });

    it('should throw error for invalid channel', () => {
      expect(() => sendPitchBend(mockOutput as unknown as MIDIOutput, 16, 0)).toThrow('Invalid MIDI channel');
    });
  });

  describe('sendProgramChange', () => {
    it('should send correct Program Change message', () => {
      sendProgramChange(mockOutput as unknown as MIDIOutput, 0, 5);
      
      expect(mockOutput.send).toHaveBeenCalledTimes(1);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0xc0, 5]));
    });

    it('should handle different channels', () => {
      sendProgramChange(mockOutput as unknown as MIDIOutput, 15, 5);
      const [data] = mockOutput.send.mock.calls[0];
      expect(data[0]).toBe(0xcf); // 0xC0 | 15
    });

    it('should handle all valid program values', () => {
      sendProgramChange(mockOutput as unknown as MIDIOutput, 0, 0);
      let [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0xc0, 0]));

      sendProgramChange(mockOutput as unknown as MIDIOutput, 0, 127);
      [data] = mockOutput.send.mock.calls[1];
      expect(data).toEqual(new Uint8Array([0xc0, 127]));
    });

    it('should throw error for invalid parameters', () => {
      expect(() => sendProgramChange(mockOutput as unknown as MIDIOutput, 16, 5)).toThrow('Invalid MIDI channel');
      expect(() => sendProgramChange(mockOutput as unknown as MIDIOutput, 0, 128)).toThrow('Invalid program');
    });
  });

  describe('sendBankSelect', () => {
    it('should send correct Bank Select messages (MSB and LSB)', () => {
      sendBankSelect(mockOutput as unknown as MIDIOutput, 0, 0);
      
      expect(mockOutput.send).toHaveBeenCalledTimes(2);
      // First call: CC 0 (MSB)
      let [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0xb0, 0, 0]));
      // Second call: CC 32 (LSB)
      [data] = mockOutput.send.mock.calls[1];
      expect(data).toEqual(new Uint8Array([0xb0, 32, 0]));
    });

    it('should correctly split bank number into MSB and LSB', () => {
      sendBankSelect(mockOutput as unknown as MIDIOutput, 0, 16383);
      // MSB: 16383 >> 7 = 127 (0x7F), LSB: 16383 & 0x7F = 127 (0x7F)
      let [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0xb0, 0, 127]));
      [data] = mockOutput.send.mock.calls[1];
      expect(data).toEqual(new Uint8Array([0xb0, 32, 127]));
    });

    it('should handle bank numbers that require MSB only', () => {
      sendBankSelect(mockOutput as unknown as MIDIOutput, 0, 128);
      // MSB: 128 >> 7 = 1, LSB: 128 & 0x7F = 0
      let [data] = mockOutput.send.mock.calls[0];
      expect(data).toEqual(new Uint8Array([0xb0, 0, 1]));
      [data] = mockOutput.send.mock.calls[1];
      expect(data).toEqual(new Uint8Array([0xb0, 32, 0]));
    });

    it('should handle different channels', () => {
      sendBankSelect(mockOutput as unknown as MIDIOutput, 5, 0);
      let [data] = mockOutput.send.mock.calls[0];
      expect(data[0]).toBe(0xb5); // 0xB0 | 5
      [data] = mockOutput.send.mock.calls[1];
      expect(data[0]).toBe(0xb5); // 0xB0 | 5
    });

    it('should include timestamp when provided', () => {
      sendBankSelect(mockOutput as unknown as MIDIOutput, 0, 0, 1000);
      expect(mockOutput.send).toHaveBeenCalledWith(expect.any(Uint8Array), 1000);
      expect(mockOutput.send).toHaveBeenCalledWith(expect.any(Uint8Array), 1001);
    });

    it('should throw error for invalid bank number', () => {
      expect(() => sendBankSelect(mockOutput as unknown as MIDIOutput, 0, -1)).toThrow('Invalid MIDI bank');
      expect(() => sendBankSelect(mockOutput as unknown as MIDIOutput, 0, 16384)).toThrow('Invalid MIDI bank');
    });

    it('should throw error for invalid channel', () => {
      expect(() => sendBankSelect(mockOutput as unknown as MIDIOutput, 16, 0)).toThrow('Invalid MIDI channel');
    });
  });
});

