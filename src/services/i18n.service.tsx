// services/i18n.ts
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import arCommon from '../../public/locales/ar/common.json';
import daCommon from '../../public/locales/da/common.json';
import deCommon from '../../public/locales/de/common.json';
import elCommon from '../../public/locales/el/common.json';
import frCommon from '../../public/locales/fr/common.json';
import enCommon from '../../public/locales/en/common.json';
import fiCommon from '../../public/locales/fi/common.json';
import filCommon from '../../public/locales/fil/common.json';
import hiCommon from '../../public/locales/hi/common.json';
import huCommon from '../../public/locales/hu/common.json';
import idCommon from '../../public/locales/id/common.json';
import itCommon from '../../public/locales/it/common.json';
import jaCommon from '../../public/locales/ja/common.json';
import koCommon from '../../public/locales/ko/common.json';
import mnCommon from '../../public/locales/mn/common.json';
import nlCommon from '../../public/locales/nl/common.json';
import plCommon from '../../public/locales/pl/common.json';
import ptCommon from '../../public/locales/pt/common.json';
import ptbrCommon from '../../public/locales/pt-BR/common.json';
import ruCommon from '../../public/locales/ru/common.json';
import svCommon from '../../public/locales/sv/common.json';
import thCommon from '../../public/locales/th/common.json';
import trCommon from '../../public/locales/tr/common.json';
import viCommon from '../../public/locales/vi/common.json';
import zhCommon from '../../public/locales/zh/common.json';
import zhHantCommon from '../../public/locales/zh-Hant/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { common: arCommon },
      da: { common: daCommon },
      de: { common: deCommon },
      el: { common: elCommon },
      en: { common: enCommon },
      fi: { common: fiCommon },
      fil: { common: filCommon },
      fr: { common: frCommon },
      hi: { common: hiCommon },
      hu: { common: huCommon },
      id: { common: idCommon },
      it: { common: itCommon },
      ja: { common: jaCommon },
      ko: { common: koCommon },
      mn: { common: mnCommon },
      nl: { common: nlCommon },
      pl: { common: plCommon },
      pt: { common: ptCommon },
      'pt-BR': { common: ptbrCommon },
      ru: { common: ruCommon },
      sv: { common: svCommon },
      th: { common: thCommon },
      tr: { common: trCommon },
      vi: { common: viCommon },
      zh: { common: zhCommon },
      'zh-Hant': { common: zhHantCommon },
    },
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
