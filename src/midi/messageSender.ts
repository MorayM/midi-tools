/**
 * MIDI message sender functions
 * All functions validate input ranges and construct proper MIDI messages
 */

/**
 * Validates MIDI channel (0-15)
 */
function validateChannel(channel: number): void {
  if (!Number.isInteger(channel) || channel < 0 || channel > 15) {
    throw new Error(`Invalid MIDI channel: ${channel}. Must be 0-15`);
  }
}

/**
 * Validates MIDI value (0-127)
 */
function validateValue(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 127) {
    throw new Error(`Invalid ${name}: ${value}. Must be 0-127`);
  }
}

/**
 * Validates pitch bend value (-8192 to 8191)
 */
function validatePitchBend(value: number): void {
  if (!Number.isInteger(value) || value < -8192 || value > 8191) {
    throw new Error(`Invalid pitch bend value: ${value}. Must be -8192 to 8191`);
  }
}

/**
 * Validates MIDI bank (0-16383)
 */
function validateBank(bank: number): void {
  if (!Number.isInteger(bank) || bank < 0 || bank > 16383) {
    throw new Error(`Invalid MIDI bank: ${bank}. Must be 0-16383`);
  }
}

/**
 * Sends a MIDI Note On message
 * @param output - MIDI output device
 * @param channel - MIDI channel (0-15)
 * @param note - MIDI note number (0-127)
 * @param velocity - Note velocity (0-127)
 * @param timestamp - Optional timestamp in milliseconds
 * @throws {Error} if parameters are out of range
 */
export function sendNoteOn(
  output: MIDIOutput,
  channel: number,
  note: number,
  velocity: number,
  timestamp?: number,
): void {
  validateChannel(channel);
  validateValue(note, 'note');
  validateValue(velocity, 'velocity');

  const statusByte = 0x90 | channel; // Note On: 0x90 + channel
  const data = new Uint8Array([statusByte, note, velocity]);
  output.send(data, timestamp);
}

/**
 * Sends a MIDI Note Off message
 * @param output - MIDI output device
 * @param channel - MIDI channel (0-15)
 * @param note - MIDI note number (0-127)
 * @param velocity - Note off velocity (0-127, defaults to 0)
 * @param timestamp - Optional timestamp in milliseconds
 * @throws {Error} if parameters are out of range
 */
export function sendNoteOff(
  output: MIDIOutput,
  channel: number,
  note: number,
  velocity: number = 0,
  timestamp?: number,
): void {
  validateChannel(channel);
  validateValue(note, 'note');
  validateValue(velocity, 'velocity');

  const statusByte = 0x80 | channel; // Note Off: 0x80 + channel
  const data = new Uint8Array([statusByte, note, velocity]);
  output.send(data, timestamp);
}

/**
 * Sends a MIDI Control Change (CC) message
 * @param output - MIDI output device
 * @param channel - MIDI channel (0-15)
 * @param controller - Controller number (0-127)
 * @param value - Controller value (0-127)
 * @param timestamp - Optional timestamp in milliseconds
 * @throws {Error} if parameters are out of range
 */
export function sendControlChange(
  output: MIDIOutput,
  channel: number,
  controller: number,
  value: number,
  timestamp?: number,
): void {
  validateChannel(channel);
  validateValue(controller, 'controller');
  validateValue(value, 'value');

  const statusByte = 0xb0 | channel; // Control Change: 0xB0 + channel
  const data = new Uint8Array([statusByte, controller, value]);
  output.send(data, timestamp);
}

/**
 * Sends a MIDI Pitch Bend message
 * @param output - MIDI output device
 * @param channel - MIDI channel (0-15)
 * @param value - Pitch bend value (-8192 to 8191, 0 = center)
 * @param timestamp - Optional timestamp in milliseconds
 * @throws {Error} if parameters are out of range
 */
export function sendPitchBend(
  output: MIDIOutput,
  channel: number,
  value: number,
  timestamp?: number,
): void {
  validateChannel(channel);
  validatePitchBend(value);

  // Convert signed 14-bit value to two 7-bit bytes
  // Add 8192 to make it unsigned (0-16383), then split into LSB and MSB
  const unsignedValue = value + 8192;
  const lsb = unsignedValue & 0x7f; // Lower 7 bits
  const msb = (unsignedValue >> 7) & 0x7f; // Upper 7 bits

  const statusByte = 0xe0 | channel; // Pitch Bend: 0xE0 + channel
  const data = new Uint8Array([statusByte, lsb, msb]);
  output.send(data, timestamp);
}

/**
 * Sends a MIDI Program Change message
 * @param output - MIDI output device
 * @param channel - MIDI channel (0-15)
 * @param program - Program number (0-127)
 * @param timestamp - Optional timestamp in milliseconds
 * @throws {Error} if parameters are out of range
 */
export function sendProgramChange(
  output: MIDIOutput,
  channel: number,
  program: number,
  timestamp?: number,
): void {
  validateChannel(channel);
  validateValue(program, 'program');

  const statusByte = 0xc0 | channel; // Program Change: 0xC0 + channel
  const data = new Uint8Array([statusByte, program]);
  output.send(data, timestamp);
}

/**
 * Sends a MIDI Bank Select message (CC 0 for MSB, CC 32 for LSB)
 * @param output - MIDI output device
 * @param channel - MIDI channel (0-15)
 * @param bank - Bank number (0-16383)
 * @param timestamp - Optional timestamp in milliseconds
 * @throws {Error} if parameters are out of range
 */
export function sendBankSelect(
  output: MIDIOutput,
  channel: number,
  bank: number,
  timestamp?: number,
): void {
  validateChannel(channel);
  validateBank(bank);

  // Bank Select uses CC 0 (MSB) and CC 32 (LSB)
  const msb = (bank >> 7) & 0x7f; // Upper 7 bits
  const lsb = bank & 0x7f; // Lower 7 bits

  // Send MSB (CC 0)
  sendControlChange(output, channel, 0, msb, timestamp);
  // Send LSB (CC 32) - slight delay to ensure proper ordering
  const lsbTimestamp = timestamp !== undefined ? timestamp + 1 : undefined;
  sendControlChange(output, channel, 32, lsb, lsbTimestamp);
}

