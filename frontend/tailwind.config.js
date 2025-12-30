/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // LeetCode Dark Theme Colors
        dark: {
          50: '#f1f1f1',
          100: '#d1d1d1',
          200: '#b4b4b4',
          300: '#9a9a9a',
          400: '#818181',
          500: '#6a6a6a',
          600: '#4a4a4a',
          700: '#3a3a3a',
          800: '#2d2d2d',
          850: '#262626',
          900: '#1a1a1a',
          950: '#0f0f0f',
        },
        white: '#e5e7eb', // Softer white (gray-200) to reduce eye strain
        // LeetCode Brand Colors
        brand: {
          orange: '#ffa116',
          yellow: '#ffc01e',
        },
        // Difficulty Colors
        difficulty: {
          easy: '#00b8a3',
          medium: '#ffc01e',
          hard: '#ef4743',
        },
        // Status Colors
        status: {
          accepted: '#00b8a3',
          wrong: '#ef4743',
          pending: '#ffc01e',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'breath-active': 'breath 3s ease-in-out infinite',
        'breath-seconds': 'breath 1s linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        breath: {
          '0%': { 
            transform: 'scale(1.25)', 
            filter: 'brightness(1.2) drop-shadow(0 0 25px rgba(139,0,0,0.9)) drop-shadow(0 0 15px rgba(220,20,60,0.8))',
            borderColor: 'rgba(220,20,60,0.8)'
          },
          '100%': { 
            transform: 'scale(1)', 
            filter: 'brightness(1) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
            borderColor: 'rgba(255,255,255,0.1)'
          },
        },
      },
    },
  },
  plugins: [],
}
