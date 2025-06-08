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
        brand: '#635BFF', // feel free to adjust
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      },
      keyframes: {
        // Professional animations can be added here
      },
    },
    animation: {
      // Professional animations can be added here
    },
  },
  plugins: [require('@tailwindcss/typography')],
}; 