import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00BFA6', // Trust, calm
          hover: '#00A896',
        },
        warning: {
          DEFAULT: '#FF6B6B', // Attention
          hover: '#FF5252',
        },
        text: '#2E2E2E',
        gradient: {
          start: '#F0F4FF',
          end: '#F7F7FF',
          borderStart: '#A0C4FF',
          borderEnd: '#FF6B6B',
        },
        neutral: {
          50: '#F3F4F6',
          100: '#E5E7EB',
          300: '#9CA3AF',
          500: '#6B7280',
          700: '#374151',
          900: '#1F2937'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        secondary: ['Lexend', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['1.5rem', { lineHeight: '1.2', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '30px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        'glass': '12px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(180deg, var(--gradient-start), var(--gradient-end))',
        'gradient-border': 'linear-gradient(45deg, var(--gradient-border-start), var(--gradient-border-end))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config; 