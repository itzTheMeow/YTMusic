/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{svelte,js,ts}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "dark",
      "light",
      "aqua",
      "black",
      "dracula",
      "forest",
      "synthwave",
      {
        discord: {
          primary: "#5865f2",
          "primary-content": "#ffffff",
          secondary: "#5865f2",
          "secondary-content": "#ffffff",
          accent: "#4f545c",
          "accent-content": "#ffffff",
          neutral: "#202225",
          "base-100": "#36393f",
          "base-200": "#2f3136",
          "base-300": "#202225",
          success: "#3ba55d",
          "success-content": "#ffffff",
          warning: "#cb8515",
          "warning-content": "#ffffff",
          error: "#ed4245",
          "error-content": "#ffffff",
        },
      },
    ],
  },
};
