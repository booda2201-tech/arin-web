/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F0D',
        navy: '#0E1C2A',
        forest: {
          DEFAULT: '#17302D',
          deep: '#122B2A',
          soft: '#245049',
        },
        gold: {
          DEFAULT: '#C3A462',
          glow: '#E6A15C',
          light: '#D5BF85',
        },
        cream: '#F3EFE6',
        ivory: '#F7F3EC',
        sand: '#E8E1D4',
        paper: '#EEE9DF',
        line: '#D6CBB9',
        charcoal: '#1F2927',
        platinum: '#9CA3AF',
        olive: '#6D7F72',
        terracotta: '#C87552',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['"El Messiri"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        latin: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(195,164,98,0.28), 0 18px 60px -24px rgba(195,164,98,0.45)',
        lift: '0 40px 80px -50px rgba(0,0,0,0.9)',
      },
      maxWidth: {
        content: '1600px',
      },
      backgroundImage: {
        volumetric:
          'radial-gradient(60% 55% at 50% 0%, rgba(195,164,98,0.16) 0%, rgba(11,15,13,0) 70%)',
        'grid-fine':
          'linear-gradient(rgba(243,244,246,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(243,244,246,0.045) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '64px 64px',
      },
      transitionTimingFunction: {
        cine: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
};
