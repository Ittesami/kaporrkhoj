/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#faf7f2",
        ink: "#1c1917",
        muted: "#78716c",
        line: "#e7e2d9",
        komla: { DEFAULT: "#e2621b", dark: "#b94c10", light: "#fdeee4" },
        sobuj: { DEFAULT: "#0f5132", light: "#e3efe8" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
