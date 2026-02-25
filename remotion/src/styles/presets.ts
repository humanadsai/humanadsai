export const bgPresets: Record<string, { background: string; textColor: string }> = {
  gradient_blue: {
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    textColor: '#ffffff',
  },
  gradient_purple: {
    background: 'linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)',
    textColor: '#ffffff',
  },
  solid_dark: {
    background: '#0a0a0a',
    textColor: '#ffffff',
  },
  solid_white: {
    background: '#fafafa',
    textColor: '#1a1a1a',
  },
  brand: {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    textColor: '#ffffff',
  },
  danger_red: {
    background: 'linear-gradient(135deg, #1a0000, #4a0000, #2a0000)',
    textColor: '#ff4444',
  },
  warm_amber: {
    background: 'linear-gradient(135deg, #1a1000, #3a2800, #2a1a00)',
    textColor: '#ffb347',
  },
  clean_minimal: {
    background: '#ffffff',
    textColor: '#1a1a1a',
  },
};

export function getPreset(name?: string) {
  return bgPresets[name || 'solid_dark'] || bgPresets.solid_dark;
}
