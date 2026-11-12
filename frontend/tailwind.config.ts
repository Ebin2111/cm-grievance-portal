import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: { 50: '#ecf5f1', 100: '#d3e8de', 600: '#1f6f54', 700: '#195a45', 800: '#14483a', 900: '#0f3a2f' } },
    },
  },
  plugins: [],
};
export default config;
