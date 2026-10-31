export const colors = {
  bg: '#08080C',
  bgRaised: '#14141B',
  card: '#1C1C25',
  line: '#272732',
  text: '#FFFFFF',
  muted: '#9C9CAB',
  faint: '#5E5E6C',
  accent: '#FF2D6F',
  accentDeep: '#C4124F',
  accentSoft: 'rgba(255,45,111,0.16)',
  gold: '#FFC34D',
  onAccent: '#FFFFFF',
  scrim: 'rgba(0,0,0,0.55)',
};

export const gradients = {
  accent: ['#FF4D7E', '#E0115A'] as const,
  posterFade: ['rgba(8,8,12,0)', 'rgba(8,8,12,0.55)', 'rgba(8,8,12,0.96)'] as const,
  topFade: ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)'] as const,
  bottomFade: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.85)'] as const,
};

export const spacing = {
  screen: 16,
  gap: 10,
};