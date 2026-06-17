/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Google Material / DV360 palette extracted from the reference
        gblue: {
          DEFAULT: '#1a73e8',
          50: '#e8f0fe',
          100: '#d2e3fc',
          600: '#1a73e8',
          700: '#1967d2',
          800: '#185abc',
        },
        gtext: {
          primary: '#202124',
          secondary: '#5f6368',
          disabled: '#80868b',
        },
        gborder: {
          DEFAULT: '#dadce0',
          light: '#e8eaed',
        },
        gbg: {
          page: '#f1f3f4',
          hover: '#f8f9fa',
          rowhover: '#f5f7f9',
        },
        gstatus: {
          green: '#1e8e3e',
          greenDot: '#34a853',
          amber: '#f9ab00',
          amberBg: '#fef7e0',
          red: '#d93025',
          redBg: '#fce8e6',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        gsans: ['Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        '11': '11px',
        '12': '12px',
        '13': '13px',
        '14': '14px',
        '22': '22px',
      },
      boxShadow: {
        gcard: '0 1px 2px 0 rgba(60,64,67,.1), 0 1px 3px 1px rgba(60,64,67,.08)',
        gmenu: '0 2px 6px 2px rgba(60,64,67,.15), 0 1px 2px 0 rgba(60,64,67,.3)',
        gpanel: '-2px 0 8px 0 rgba(60,64,67,.1)',
      },
    },
  },
  plugins: [],
}
