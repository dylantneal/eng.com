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
      /* A stack of 5 blurred blobs, one in each corner + centre */
      backgroundImage: {
        rainbow: `
          radial-gradient( circle at  0%   0%,  rgba(59,130,246,0.35) 0%, transparent 60% ),
          radial-gradient( circle at 100%   0%,  rgba(236,72,153,0.35) 0%, transparent 60% ),
          radial-gradient( circle at 100% 100%,  rgba(16,185,129,0.35) 0%, transparent 60% ),
          radial-gradient( circle at  0% 100%,  rgba(245,158,11,0.35) 0%, transparent 60% ),
          radial-gradient( circle at 50%  50%,  rgba(217,70,239,0.35) 0%, transparent 60% )
        `,
      },
      keyframes: {
        'rainbow-pan': {
          '0%,100%': { backgroundPosition: '0% 0%' },
          '50%':     { backgroundPosition: '200% 200%' },
        },
        /* spin the entire spectrum */
        'hue-spin': {
          '0%':   { filter: 'hue-rotate(0deg)'   },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
      },
    },
    animation: {
      'rainbow-drift': 'rainbow-pan 40s ease-in-out infinite',
      'rainbow-hue':   'hue-spin     50s linear infinite',
    },
  },
  plugins: [require('@tailwindcss/typography')],
}; 