import { useState } from 'react';
import { DeviceSelector } from './components/DeviceSelector';
import { ChannelSelector } from './components/ChannelSelector';
import { PianoKeyboard } from './components/PianoKeyboard';
import { PanicButton } from './components/PanicButton';
import './App.css';

function App() {
  const [selectedDevice, setSelectedDevice] = useState<MIDIOutput | null>(null);
  const [channel, setChannel] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>MIDI Tools</h1>
      </header>
      <main className="app-main">
        <div className="controls">
          <DeviceSelector onDeviceChange={setSelectedDevice} />
          <ChannelSelector channel={channel} onChannelChange={setChannel} />
        </div>
        <PianoKeyboard output={selectedDevice} channel={channel} />
        <div className="panic-container">
          <PanicButton output={selectedDevice} />
        </div>
      </main>
    </div>
  );
}

export default App;
