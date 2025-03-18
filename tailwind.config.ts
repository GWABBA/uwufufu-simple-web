import type { Config } from 'tailwindcss';
// import lineClamp from '@tailwindcss/line-clamp';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layouts/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'uwu-black': '#212121',
        'uwu-gray': '#3e3e3e',
        'uwu-dark-gray': '#2c2c2c',
        'uwu-orange': '#ff6f54',
        'uwu-red': '#e73929',
        'uwu-blue': '#3aaef0',
      },
      keyframes: {
        glow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'gradient-glow': 'glow 3s ease infinite',
      },
    },
  },
  // plugins: [lineClamp],
} satisfies Config;
