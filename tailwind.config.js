/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'stone': {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Sora', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'kenburns': {
          '0%': {
            transform: 'scale(1.0) translate(0, 0)',
          },
          '100%': {
            transform: 'scale(1.1) translate(-2%, -2%)',
          }
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'kenburns': 'kenburns 20s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
      },
      transitionDuration: {
        '2000': '2000ms',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#44403C',
            h2: {
              color: '#292524',
              fontWeight: '700',
              fontFamily: 'Sora, sans-serif',
              marginTop: '2em',
              marginBottom: '1em',
            },
            h3: {
              color: '#292524',
              fontWeight: '600',
              fontFamily: 'Sora, sans-serif',
              marginTop: '1.5em',
              marginBottom: '0.75em',
            },
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};