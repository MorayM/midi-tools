import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('should render the app title', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('MIDI Tools');
  });

  it('should render device selector', () => {
    render(<App />);
    expect(screen.getByLabelText('MIDI Device:')).toBeTruthy();
  });

  it('should render channel selector', () => {
    render(<App />);
    expect(screen.getByLabelText('Channel:')).toBeTruthy();
  });

  it('should render piano keyboard', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('C3');
    expect(container.textContent).toContain('C4');
  });

  it('should render panic button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /panic/i })).toBeTruthy();
  });
});
