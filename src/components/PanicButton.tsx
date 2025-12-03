import { sendAllNotesOff } from '../midi/messageSender';
import './PanicButton.css';

interface PanicButtonProps {
  output: MIDIOutput | null;
}

export function PanicButton({ output }: PanicButtonProps) {
  const handlePanic = () => {
    if (!output) return;
    
    // Send All Notes Off on all 16 channels
    for (let channel = 0; channel < 16; channel++) {
      sendAllNotesOff(output, channel);
    }
  };

  return (
    <button
      type="button"
      className="panic-button"
      onClick={handlePanic}
      disabled={!output}
      title="Send All Notes Off on all channels"
    >
      Panic
    </button>
  );
}

