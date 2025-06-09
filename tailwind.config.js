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
          DEFAULT: '#635BFF', // Stripe-like blue
          50: '#f5f5ff',
          100: '#ebebff',
          500: '#635BFF',
          600: '#5748e6',
          700: '#4c3fcc',
          emphasis: '#5748e6'
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'rotate3d': {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
          '25%': { transform: 'rotateX(45deg) rotateY(90deg)' },
          '50%': { transform: 'rotateX(90deg) rotateY(180deg)' },
          '75%': { transform: 'rotateX(45deg) rotateY(270deg)' },
          '100%': { transform: 'rotateX(0deg) rotateY(360deg)' }
        }
      },
      animation: {
        gradient: 'gradient 3s ease infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'rotate-3d': 'rotate3d 20s linear infinite',
      },
      perspective: {
        '1000': '1000px',
      },
      backgroundSize: {
        '300%': '300%',
      },
      backgroundPosition: {
        'left-right': 'left center, right center',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}; 