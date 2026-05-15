import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        moss: "#4f6f52",
        coral: "#d45d4c",
        gold: "#c48b28",
        mist: "#eef3ef"
      }
    }
  },
  plugins: []
};

export default config;
