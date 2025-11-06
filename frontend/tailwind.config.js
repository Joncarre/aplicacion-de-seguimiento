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
        // Líneas de autobús
        line: {
          1: {
            DEFAULT: '#86efac', // green-300
            dark: '#4ade80',    // green-400
            light: '#bbf7d0',   // green-200
          },
          2: {
            DEFAULT: '#6ee7b7', // emerald-300
            dark: '#34d399',    // emerald-400
            light: '#a7f3d0',   // emerald-200
          },
          3: {
            DEFAULT: '#5eead4', // teal-300
            dark: '#2dd4bf',    // teal-400
            light: '#99f6e4',   // teal-200
          },
          4: {
            DEFAULT: '#7dd3fc', // sky-300
            dark: '#38bdf8',    // sky-400
            light: '#bae6fd',   // sky-200
          },
        },
        // Colores personalizados
        accent: {
          primary: '#10b981',  // green-500
          hover: '#059669',    // green-600
          active: '#047857',   // green-700
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
