import './ChannelSelector.css';

interface ChannelSelectorProps {
  channel: number;
  onChannelChange: (channel: number) => void;
}

export function ChannelSelector({ channel, onChannelChange }: ChannelSelectorProps) {
  const channels = Array.from({ length: 16 }, (_, i) => i);

  return (
    <div className="channel-selector">
      <label htmlFor="midi-channel-select">Channel:</label>
      <select
        id="midi-channel-select"
        value={channel}
        onChange={(e) => onChannelChange(Number.parseInt(e.target.value, 10))}
      >
        {channels.map((ch) => (
          <option key={ch} value={ch}>
            {ch + 1}
          </option>
        ))}
      </select>
    </div>
  );
}

