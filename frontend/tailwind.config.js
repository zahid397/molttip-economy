/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "neon-blue": "#00f3ff",
        "neon-cyan": "#0ef0f0",
        "neon-purple": "#b026ff",

        "glass-dark": "rgba(10, 10, 20, 0.7)",
        "glass-light": "rgba(255, 255, 255, 0.1)"
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
