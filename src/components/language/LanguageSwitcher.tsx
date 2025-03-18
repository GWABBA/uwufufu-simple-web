'use client';

import { useTranslation } from 'react-i18next';
import { Locales } from '@/enums/enums.enum';

const languageLabels: Record<Locales, string> = {
  [Locales.AR]: 'العربية',
  [Locales.DA]: 'Dansk',
  [Locales.DE]: 'Deutsch',
  [Locales.EL]: 'Ελληνικά',
  [Locales.EN]: 'English',
  [Locales.ES]: 'Español',
  [Locales.FI]: 'Suomi',
  [Locales.FIL]: 'Filipino',
  [Locales.FR]: 'Français',
  [Locales.HI]: 'हिन्दी',
  [Locales.HU]: 'Magyar',
  [Locales.ID]: 'Bahasa Indonesia',
  [Locales.IT]: 'Italiano',
  [Locales.JA]: '日本語',
  [Locales.KO]: '한국어',
  [Locales.MN]: 'Монгол',
  [Locales.NL]: 'Nederlands',
  [Locales.PL]: 'Polski',
  [Locales.PT_BR]: 'Português (Brasil)',
  [Locales.PT]: 'Português',
  [Locales.RU]: 'Русский',
  [Locales.SV]: 'Svenska',
  [Locales.TH]: 'ไทย',
  [Locales.TR]: 'Türkçe',
  [Locales.VI]: 'Tiếng Việt',
  [Locales.ZH_HANT]: '繁體中文',
  [Locales.ZH]: '简体中文',
};

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="rounded-md px-2 py-1 bg-gray-700 text-white"
    >
      {Object.entries(languageLabels).map(([code, label]) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}
