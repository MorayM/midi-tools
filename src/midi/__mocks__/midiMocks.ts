/**
 * Mock implementations of Web MIDI API for testing
 */

export interface MockMidiPort {
  id: string;
  name: string;
  manufacturer?: string;
  state: MIDIPortDeviceState;
  connection: MIDIPortConnectionState;
  type: 'input' | 'output';
  onstatechange: ((event: MIDIConnectionEvent) => void) | null;
}

export interface MockMidiOutput extends MockMidiPort {
  type: 'output';
  send: jest.Mock<void, [data: Uint8Array | number[], timestamp?: number]>;
}

export interface MockMidiAccess {
  inputs: Map<string, MockMidiPort>;
  outputs: Map<string, MockMidiOutput>;
  onstatechange: ((event: MIDIConnectionEvent) => void) | null;
  sysexEnabled: boolean;
}

/**
 * Creates a mock MIDI output port
 */
export function createMockMidiOutput(
  id: string,
  name: string,
  manufacturer?: string,
): MockMidiOutput {
  const sendMock = jest.fn<void, [data: Uint8Array | number[], timestamp?: number]>();
  
  return {
    id,
    name,
    manufacturer,
    state: 'connected',
    connection: 'open',
    type: 'output',
    onstatechange: null,
    send: sendMock,
  };
}

/**
 * Creates a mock MIDI access object
 */
export function createMockMidiAccess(
  outputs: MockMidiOutput[] = [],
): MockMidiAccess {
  const outputsMap = new Map<string, MockMidiOutput>();
  outputs.forEach((output) => {
    outputsMap.set(output.id, output);
  });

  return {
    inputs: new Map(),
    outputs: outputsMap,
    onstatechange: null,
    sysexEnabled: false,
  };
}

/**
 * Sets up global navigator.requestMIDIAccess mock
 */
export function setupMidiAccessMock(mockAccess: MockMidiAccess): void {
  const mockFn = jest.fn<Promise<MIDIAccess>, []>().mockResolvedValue(
    mockAccess as unknown as MIDIAccess,
  );
  
  // Set on both global.navigator and navigator to ensure compatibility
  if (global.navigator) {
    (global.navigator as unknown as { requestMIDIAccess?: typeof mockFn }).requestMIDIAccess = mockFn;
  }
  if (typeof navigator !== 'undefined') {
    (navigator as unknown as { requestMIDIAccess?: typeof mockFn }).requestMIDIAccess = mockFn;
  }
}

/**
 * Clears MIDI access mock by setting it to undefined
 */
export function clearMidiAccessMock(): void {
  // Clear both global.navigator and navigator to match setupMidiAccessMock
  if (global.navigator) {
    (global.navigator as { requestMIDIAccess?: unknown }).requestMIDIAccess = undefined;
  }
  if (typeof navigator !== 'undefined') {
    (navigator as { requestMIDIAccess?: unknown }).requestMIDIAccess = undefined;
  }
}

