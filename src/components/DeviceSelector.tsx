import { useState, useEffect } from 'react';
import { listMidiOutputDevices, getMidiOutput, MidiNotSupportedError, MidiAccessDeniedError } from '../midi/deviceManager';
import type { MidiDeviceInfo } from '../midi/types';
import './DeviceSelector.css';

interface DeviceSelectorProps {
  onDeviceChange: (device: MIDIOutput | null) => void;
}

export function DeviceSelector({ onDeviceChange }: DeviceSelectorProps) {
  const [devices, setDevices] = useState<MidiDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const deviceList = await listMidiOutputDevices();
      setDevices(deviceList);
      if (deviceList.length > 0 && !selectedDeviceId) {
        // Auto-select first device if none selected
        setSelectedDeviceId(deviceList[0].id);
      }
    } catch (err) {
      if (err instanceof MidiNotSupportedError) {
        setError('Web MIDI API is not supported in this browser');
      } else if (err instanceof MidiAccessDeniedError) {
        setError('MIDI access was denied. Please allow MIDI access and refresh.');
      } else {
        setError('Failed to load MIDI devices');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    const handleDeviceChange = async () => {
      if (!selectedDeviceId) {
        onDeviceChange(null);
        return;
      }

      try {
        const device = await getMidiOutput(selectedDeviceId);
        onDeviceChange(device);
      } catch (err) {
        setError('Failed to get MIDI device');
        onDeviceChange(null);
      }
    };

    handleDeviceChange();
  }, [selectedDeviceId, onDeviceChange]);

  return (
    <div className="device-selector">
      <label htmlFor="midi-device-select">MIDI Device:</label>
      <div className="device-selector-controls">
        <select
          id="midi-device-select"
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          disabled={loading || devices.length === 0}
        >
          {devices.length === 0 && !loading && (
            <option value="">No devices available</option>
          )}
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} {device.state === 'disconnected' ? '(disconnected)' : ''}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={loadDevices}
          disabled={loading}
          className="refresh-button"
          title="Refresh device list"
        >
          ↻
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading devices...</div>}
    </div>
  );
}

