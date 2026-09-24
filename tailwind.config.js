/** @type {import('tailwindcss').Config} */
// Palette, type scale, radii and shadows extracted from the REAL DV360 (ACX/Aplos
// design system). See design/DESIGN_SYSTEM.md for the source-of-truth mapping.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gblue: {
          DEFAULT: '#1a73e8',
          50: '#e8f0fe',   // primary container / light-blue bg
          100: '#d2e3fc',  // accent
          200: '#8ab4f8',  // inverse primary
          600: '#1a73e8',  // primary
          700: '#1967d2',  // hover / on-primary-container
          800: '#185abc',  // pressed
          900: '#174ea6',  // focus / link-focus
        },
        gtext: {
          primary: '#202124',    // on-surface / on-background
          strong: '#3c4043',     // on-surface (strong secondary)
          secondary: '#5f6368',  // on-surface-variant
          disabled: '#80868b',
          faint: '#9aa0a6',
        },
        gborder: {
          DEFAULT: '#dadce0',    // hairline
          light: '#e8eaed',
          strong: '#80868b',     // hairline-variant
        },
        gbg: {
          page: '#f1f3f4',       // surface-variant
          hover: '#f8f9fa',
          rowhover: '#f5f7f9',
          inverse: '#202124',    // tooltips
        },
        // Semantic status + data colors (badges, chips, charts) — exact ACX values
        gstatus: {
          green: '#188038',      // success (was #1e8e3e — corrected to DV360)
          greenDot: '#34a853',
          greenBg: '#e6f4ea',
          greenText: '#137333',
          amber: '#f9ab00',      // warning
          amberText: '#a85d00',
          amberBg: '#fef7e0',
          red: '#d93025',        // error
          redText: '#c5221f',
          redBg: '#fce8e6',
        },
        gdata: {
          blue: '#1a73e8', blueBg: '#e8f0fe',
          red: '#d93025', redBg: '#fce8e6',
          amber: '#f9ab00', amberBg: '#fef7e0',
          green: '#188038', greenBg: '#e6f4ea',
          pink: '#d01884', pinkBg: '#fde7f3',
          purple: '#9334e6', purpleBg: '#f3e8fd',
          teal: '#007b83', tealBg: '#e4f7fb',
        },
        glink: {
          DEFAULT: '#1a73e8',
          hover: '#174ea6',
          visited: '#8430ce',
        },
      },
      fontFamily: {
        // Body: Roboto (exact). Headings: DV360 uses Google Sans (proprietary,
        // unavailable) → Roboto 500 stand-in. If a machine has Google Sans it wins.
        sans: ['Roboto', 'Arial', 'sans-serif'],
        gsans: ['"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        '11': '11px',
        '12': '12px',
        '13': '13px',
        '14': '14px', // DV360 true body size
        '16': '16px',
        '18': '18px',
        '22': '22px',
        '24': '24px',
      },
      borderRadius: {
        gsm: '2px',
        DEFAULT: '4px',
        g: '4px',
        g6: '6px',
        g8: '8px',
        gpill: '16px',
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
