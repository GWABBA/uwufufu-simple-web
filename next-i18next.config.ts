import path from 'path';
import type { UserConfig } from 'next-i18next';

const nextI18NextConfig: UserConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: [
      'ar',
      'da',
      'de',
      'el',
      'en',
      'es',
      'fi',
      'fil',
      'fr',
      'hi',
      'hu',
      'id',
      'it',
      'ja',
      'ko',
      'mn',
      'nl',
      'pl',
      'pt-BR',
      'pt',
      'ru',
      'sv',
      'th',
      'tr',
      'vi',
      'zh-Hant',
      'zh',
    ],
  },
  localePath: path.resolve('./public/locales'),
};

export default nextI18NextConfig;
