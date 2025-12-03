import type { MidiDeviceInfo } from './types';

/**
 * Error thrown when Web MIDI API is not supported
 */
export class MidiNotSupportedError extends Error {
  constructor() {
    super('Web MIDI API is not supported in this browser');
    this.name = 'MidiNotSupportedError';
  }
}

/**
 * Error thrown when MIDI access is denied
 */
export class MidiAccessDeniedError extends Error {
  constructor() {
    super('MIDI access was denied by the user');
    this.name = 'MidiAccessDeniedError';
  }
}

/**
 * Error thrown when a MIDI device is not found
 */
export class MidiDeviceNotFoundError extends Error {
  constructor(deviceId: string) {
    super(`MIDI device with id "${deviceId}" not found`);
    this.name = 'MidiDeviceNotFoundError';
  }
}

/**
 * Requests MIDI access from the browser
 * @returns Promise that resolves to MIDIAccess object
 * @throws {MidiNotSupportedError} if Web MIDI API is not supported
 * @throws {MidiAccessDeniedError} if user denies access
 */
export async function requestMidiAccess(): Promise<MIDIAccess> {
  if (!navigator.requestMIDIAccess) {
    throw new MidiNotSupportedError();
  }

  try {
    const access = await navigator.requestMIDIAccess();
    return access;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'SecurityError') {
      throw new MidiAccessDeniedError();
    }
    throw error;
  }
}

/**
 * Lists all available MIDI output devices
 * @param access - Optional MIDIAccess object. If not provided, will request access.
 * @returns Promise that resolves to array of MIDI device info
 * @throws {MidiNotSupportedError} if Web MIDI API is not supported
 * @throws {MidiAccessDeniedError} if user denies access
 */
export async function listMidiOutputDevices(
  access?: MIDIAccess,
): Promise<MidiDeviceInfo[]> {
  const midiAccess = access ?? (await requestMidiAccess());
  const devices: MidiDeviceInfo[] = [];

  midiAccess.outputs.forEach((output) => {
    devices.push({
      id: output.id,
      name: output.name ?? 'Unknown Device',
      manufacturer: output.manufacturer ?? undefined,
      state: output.state === 'connected' ? 'connected' : 'disconnected',
    });
  });

  return devices;
}

/**
 * Gets a MIDI output instance for a specific device
 * @param deviceId - The ID of the MIDI output device
 * @param access - Optional MIDIAccess object. If not provided, will request access.
 * @returns Promise that resolves to MIDIOutput instance
 * @throws {MidiNotSupportedError} if Web MIDI API is not supported
 * @throws {MidiAccessDeniedError} if user denies access
 * @throws {MidiDeviceNotFoundError} if device is not found
 */
export async function getMidiOutput(
  deviceId: string,
  access?: MIDIAccess,
): Promise<MIDIOutput> {
  const midiAccess = access ?? (await requestMidiAccess());
  const output = midiAccess.outputs.get(deviceId);

  if (!output) {
    throw new MidiDeviceNotFoundError(deviceId);
  }

  return output;
}

