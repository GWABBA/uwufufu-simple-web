'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/services/i18n.service';
import { ReactNode, useEffect } from 'react';

type Props = { children: ReactNode; initialLocale: string };

export default function ClientTranslationsProvider({
  children,
  initialLocale,
}: Props) {
  useEffect(() => {
    if (i18n.language !== initialLocale) {
      i18n.changeLanguage(initialLocale);
    }
  }, [initialLocale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
