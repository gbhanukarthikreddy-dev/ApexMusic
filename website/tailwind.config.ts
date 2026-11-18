import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        bone: '#F2F2F0',
        mute: '#8A8A87',
        line: 'rgba(255, 255, 255, 0.08)',
        apex: '#FF4500',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        label: '0.25em',
      },
      borderRadius: {
        frame: '48px',
      },
    },
  },
  plugins: [],
};

export default config;
