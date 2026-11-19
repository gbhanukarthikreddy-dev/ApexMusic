import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#09090B',
        panel: '#111114',
        'panel-hover': '#16161A',
        'ink-primary': '#F4F4F2',
        'ink-secondary': '#9A9AA3',
        'ink-muted': '#63636B',
        rule: 'rgba(255, 255, 255, 0.09)',
        'rule-strong': 'rgba(255, 255, 255, 0.16)',
        crimson: '#FA2D48',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        eq: {
          '0%, 100%': { transform: 'scaleY(0.28)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        eq: 'eq 0.9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
