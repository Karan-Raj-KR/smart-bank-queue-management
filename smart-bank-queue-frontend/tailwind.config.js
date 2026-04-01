/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0F172A', // Navy (Master Primary)
        },
        secondary: {
          DEFAULT: '#1E3A8A', // Blue (Master Secondary)
        },
        cta: {
          DEFAULT: '#CA8A04', // Gold (Master CTA)
          hover: '#A16207',
        },
        surface: {
          DEFAULT: '#F8FAFC', // Master Background
          card: '#FFFFFF',
          elevated: '#F1F5F9', // Slightly darker for contrast
        },
        text: {
          main: '#020617', // Master Text
          muted: '#475569',
        }
      },
      fontFamily: {
        serif: ['"Bodoni Moda"', 'serif'],
        sans: ['Jost', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'luxury-sm': '0 1px 2px rgba(0,0,0,0.05)',
        'luxury-md': '0 4px 6px rgba(0,0,0,0.1)',
        'luxury-lg': '0 10px 15px rgba(0,0,0,0.1)',
        'luxury-xl': '0 20px 25px rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}
