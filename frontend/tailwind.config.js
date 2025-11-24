/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Líneas de autobús con colores neón
        line: {
          1: {
            DEFAULT: '#ef476f',
            dark: '#d62d56',
            light: '#ff6b8a',
          },
          2: {
            DEFAULT: '#fd9d3c',
            dark: '#cc6600',
            light: '#ffa033',
          },
          3: {
            DEFAULT: '#06d6a0',
            dark: '#05b885',
            light: '#39e3b8',
          },
          4: {
            DEFAULT: '#118ab2',
            dark: '#0e6f8e',
            light: '#3da5c4',
          },
          5: {
            DEFAULT: '#9984d4',
            dark: '#7d68b8',
            light: '#b5a3e3',
          },
        },
        // Fondos oscuros
        dark: {
          bg: {
            primary: '#0a0e27',
            secondary: '#131729',
            tertiary: '#1a1f3a',
            card: '#0f1420',
          },
          text: {
            primary: '#e2e8f0',
            secondary: '#cbd5e1',
            muted: '#94a3b8',
          },
          border: {
            DEFAULT: '#1e293b',
            light: '#334155',
          },
        },
        // Colores de acento neón
        accent: {
          primary: '#06d6a0',
          hover: '#39e3b8',
          active: '#05b885',
        },
        neon: {
          green: '#06d6a0',
          blue: '#118ab2',
          orange: '#fd9d3c',
          pink: '#ef476f',
          purple: '#9984d4',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'sparkle': 'sparkle 15s ease-in-out infinite',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(6, 214, 160, 0.4)',
        'neon-lg': '0 0 20px rgba(6, 214, 160, 0.4), 0 0 40px rgba(6, 214, 160, 0.2)',
        'neon-xl': '0 0 30px rgba(6, 214, 160, 0.5), 0 0 60px rgba(6, 214, 160, 0.3)',
      },
    },
  },
  plugins: [],
}
