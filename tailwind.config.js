/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--accent)',
        secondary: 'var(--text-secondary)',
        background: 'var(--bg)',
        foreground: 'var(--text)',
        border: 'var(--border)',
      },
    },
  },
  plugins: [],
}