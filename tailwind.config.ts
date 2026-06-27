import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#000000',
        'bg-secondary': '#080808',
        'bg-surface': '#0E0E0E',
        'bg-elevated': '#141414',
        accent: '#00B4D8',
        'accent-hover': '#48CAE4',
        success: '#2DD4BF',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        barlow: ['Barlow', 'sans-serif'],
        noto: ['Noto Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        counter: 'counter 1.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
