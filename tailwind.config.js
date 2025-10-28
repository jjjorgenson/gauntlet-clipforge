/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for video editor
        editor: {
          bg: '#1e1e1e',
          panel: '#252526',
          border: '#3e3e42',
          hover: '#2a2d2e',
          accent: '#007acc',
        },
        timeline: {
          bg: '#1e1e1e',
          track: '#2d2d30',
          clip: '#0e639c',
          clipHover: '#1177bb',
          playhead: '#ff0000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'monospace'],
      },
      spacing: {
        'timeline-track': '60px',
        'timeline-header': '40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

