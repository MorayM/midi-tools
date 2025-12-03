import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  requestMidiAccess,
  listMidiOutputDevices,
  getMidiOutput,
  MidiNotSupportedError,
  MidiAccessDeniedError,
  MidiDeviceNotFoundError,
} from './deviceManager';
import {
  createMockMidiAccess,
  createMockMidiOutput,
  setupMidiAccessMock,
  clearMidiAccessMock,
} from './__mocks__/midiMocks';

describe('deviceManager', () => {
  beforeEach(() => {
    clearMidiAccessMock();
  });

  afterEach(() => {
    clearMidiAccessMock();
  });

  describe('requestMidiAccess', () => {
    it('should request MIDI access successfully', async () => {
      const mockOutput = createMockMidiOutput('device1', 'Test Device');
      const mockAccess = createMockMidiAccess([mockOutput]);
      setupMidiAccessMock(mockAccess);

      const access = await requestMidiAccess();
      expect(access).toBeDefined();
      expect(navigator.requestMIDIAccess).toHaveBeenCalled();
    });

    it('should throw MidiNotSupportedError when Web MIDI API is not available', async () => {
      // Remove requestMIDIAccess from navigator
      const originalRequest = (navigator as { requestMIDIAccess?: unknown }).requestMIDIAccess;
      delete (navigator as { requestMIDIAccess?: unknown }).requestMIDIAccess;

      await expect(requestMidiAccess()).rejects.toThrow(MidiNotSupportedError);

      // Restore if it existed
      if (originalRequest) {
        (navigator as Navigator).requestMIDIAccess = originalRequest as typeof navigator.requestMIDIAccess;
      }
    });

    it('should throw MidiAccessDeniedError when access is denied', async () => {
      const securityError = new DOMException('Access denied', 'SecurityError');
      const mockFn = jest.fn<Promise<MIDIAccess>, []>().mockRejectedValue(securityError);
      if (global.navigator) {
        (global.navigator as unknown as { requestMIDIAccess?: typeof mockFn }).requestMIDIAccess = mockFn;
      }
      if (typeof navigator !== 'undefined') {
        (navigator as unknown as { requestMIDIAccess?: typeof mockFn }).requestMIDIAccess = mockFn;
      }

      await expect(requestMidiAccess()).rejects.toThrow(MidiAccessDeniedError);
    });

    it('should propagate other errors', async () => {
      const otherError = new Error('Some other error');
      const mockFn = jest.fn<Promise<MIDIAccess>, []>().mockRejectedValue(otherError);
      if (global.navigator) {
        (global.navigator as unknown as { requestMIDIAccess?: typeof mockFn }).requestMIDIAccess = mockFn;
      }
      if (typeof navigator !== 'undefined') {
        (navigator as unknown as { requestMIDIAccess?: typeof mockFn }).requestMIDIAccess = mockFn;
      }

      await expect(requestMidiAccess()).rejects.toThrow('Some other error');
    });
  });

  describe('listMidiOutputDevices', () => {
    it('should return list of MIDI output devices', async () => {
      const mockOutput1 = createMockMidiOutput('device1', 'Device 1', 'Manufacturer A');
      const mockOutput2 = createMockMidiOutput('device2', 'Device 2');
      const mockAccess = createMockMidiAccess([mockOutput1, mockOutput2]);
      setupMidiAccessMock(mockAccess);

      const devices = await listMidiOutputDevices();

      expect(devices).toHaveLength(2);
      expect(devices[0]).toEqual({
        id: 'device1',
        name: 'Device 1',
        manufacturer: 'Manufacturer A',
        state: 'connected',
      });
      expect(devices[1]).toEqual({
        id: 'device2',
        name: 'Device 2',
        manufacturer: undefined,
        state: 'connected',
      });
    });

    it('should return empty array when no devices are available', async () => {
      const mockAccess = createMockMidiAccess([]);
      setupMidiAccessMock(mockAccess);

      const devices = await listMidiOutputDevices();
      expect(devices).toHaveLength(0);
    });

    it('should handle devices with null name', async () => {
      const mockOutput = createMockMidiOutput('device1', null as unknown as string);
      const mockAccess = createMockMidiAccess([mockOutput]);
      setupMidiAccessMock(mockAccess);

      const devices = await listMidiOutputDevices();
      expect(devices[0].name).toBe('Unknown Device');
    });

    it('should handle disconnected devices', async () => {
      const mockOutput = createMockMidiOutput('device1', 'Device 1');
      mockOutput.state = 'disconnected';
      const mockAccess = createMockMidiAccess([mockOutput]);
      setupMidiAccessMock(mockAccess);

      const devices = await listMidiOutputDevices();
      expect(devices[0].state).toBe('disconnected');
    });

    it('should accept optional MIDIAccess parameter', async () => {
      const mockOutput = createMockMidiOutput('device1', 'Device 1');
      const mockAccess = createMockMidiAccess([mockOutput]);
      // Set up a mock to verify it's not called
      const requestMock = jest.fn<Promise<MIDIAccess>, []>();
      if (global.navigator) {
        (global.navigator as unknown as { requestMIDIAccess?: typeof requestMock }).requestMIDIAccess = requestMock;
      }
      if (typeof navigator !== 'undefined') {
        (navigator as unknown as { requestMIDIAccess?: typeof requestMock }).requestMIDIAccess = requestMock;
      }

      const devices = await listMidiOutputDevices(mockAccess as unknown as MIDIAccess);
      expect(devices).toHaveLength(1);
      expect(requestMock).not.toHaveBeenCalled();
    });
  });

  describe('getMidiOutput', () => {
    it('should return MIDI output for valid device ID', async () => {
      const mockOutput = createMockMidiOutput('device1', 'Device 1');
      const mockAccess = createMockMidiAccess([mockOutput]);
      setupMidiAccessMock(mockAccess);

      const output = await getMidiOutput('device1');
      expect(output).toBe(mockOutput);
    });

    it('should throw MidiDeviceNotFoundError for invalid device ID', async () => {
      const mockAccess = createMockMidiAccess([]);
      setupMidiAccessMock(mockAccess);

      await expect(getMidiOutput('nonexistent')).rejects.toThrow(MidiDeviceNotFoundError);
      await expect(getMidiOutput('nonexistent')).rejects.toThrow('MIDI device with id "nonexistent" not found');
    });

    it('should accept optional MIDIAccess parameter', async () => {
      const mockOutput = createMockMidiOutput('device1', 'Device 1');
      const mockAccess = createMockMidiAccess([mockOutput]);
      // Set up a mock to verify it's not called
      const requestMock = jest.fn<Promise<MIDIAccess>, []>();
      if (global.navigator) {
        (global.navigator as unknown as { requestMIDIAccess?: typeof requestMock }).requestMIDIAccess = requestMock;
      }
      if (typeof navigator !== 'undefined') {
        (navigator as unknown as { requestMIDIAccess?: typeof requestMock }).requestMIDIAccess = requestMock;
      }

      const output = await getMidiOutput('device1', mockAccess as unknown as MIDIAccess);
      expect(output).toBe(mockOutput);
      expect(requestMock).not.toHaveBeenCalled();
    });
  });
});

