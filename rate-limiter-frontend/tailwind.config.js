/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E14',
        panel: '#131824',
        panel2: '#0F141F',
        line: '#232A38',
        line2: '#2E3648',
        muted: '#8891A3',
        text: '#E7EAF0',
        amber: {
          DEFAULT: '#FFB020',
          soft: '#FFD98A',
          dim: '#8A6420',
        },
        teal: {
          DEFAULT: '#34D3AC',
          dim: '#1C5E4E',
        },
        red: {
          DEFAULT: '#FF5D5D',
          dim: '#6E2A2A',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
      },
      keyframes: {
        rise: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        rise: 'rise 0.5s ease-out both',
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
