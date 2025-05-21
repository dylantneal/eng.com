/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        lg: '860px',   // only one breakpoint for now (desktop)
      },
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4f46e5',          // primary  ▶︎ indigo-600
          emphasis: '#4338ca',         // hover    ▶︎ indigo-700
          faint: '#eef2ff',            // subtle BG▶︎ indigo-50
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}; 