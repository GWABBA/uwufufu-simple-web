/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // 👇 기존 'tailwindcss'를 지우고 이렇게 바꾸세요
    '@tailwindcss/postcss': {},
  },
};

export default config;
