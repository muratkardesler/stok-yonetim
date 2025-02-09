/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          dark: '#818CF8'
        },
        background: {
          DEFAULT: '#F9FAFB',
          dark: '#111827'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1F2937'
        },
        text: {
          DEFAULT: '#111827',
          dark: '#F3F4F6'
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#374151'
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'count-up': 'count-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'modal-in': 'modal-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'modal-out': 'modal-out 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        'count-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'modal-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'modal-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' }
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  safelist: [
    {
      pattern: /(bg|text|border|ring)-(primary|gray|red|yellow|green|blue|indigo|purple|pink)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus', 'dark']
    }
  ]
} 