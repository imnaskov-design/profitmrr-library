import type { Config } from "tailwindcss";

const config: Config = {
  // Limit Tailwind scanning to our source directory.
  // This avoids accidentally scanning build artifacts or downloaded HTML files
  // that may contain invalid/escaped classnames.
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

