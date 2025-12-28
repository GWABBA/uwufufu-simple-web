import { dir } from 'i18next';
import type { Metadata } from 'next';
import './globals.css';
import ReduxProvider from '../components/layouts/ReduxProvider';
import Navigation from '../components/layouts/Navigation';
import config from '@/config';
import { Toaster } from 'react-hot-toast';
import { cookies } from 'next/headers';
import { fetchMeSSR } from '@/services/auth.service';
import StoreInitializer from '@/components/layouts/StoreInitializer';
import Footer from '@/components/layouts/Footer';
import Script from 'next/script';
import ClientTranslationsProvider from '@/components/language/ClientTranslationsProvider';
import { languages, fallbackLng } from '@/config/i18n';
import FreeTrial from '@/components/banner/FreeTrial';
import BannerSlot from '@/components/common/BannerSlot';

export const metadata: Metadata = {
  title: 'UwUFUFU',
  description:
    'Interactive Quizzes. From ideal type world cup to personality quizzes covering categories such as KPOP, Gaming, to food. Try creating your own quiz.',
  keywords: [
    'Ideal Type',
    'Ideal type world cup',
    'quiz',
    'quizzes',
    'this or that',
    'balance game',
    'gaming',
    'streaming',
    'streamer',
    'twitch',
    'youtube',
    'tik tok',
    'face-off',
    'pass or smash',
    'bracket',
    'uwufufu',
    'anime',
    'lol',
    'meme',
  ],
  openGraph: {
    title: 'UwUFUFU',
    description:
      'Interactive Quizzes. From ideal type world cup to personality quizzes covering categories such as KPOP, Gaming, to food. Try creating your own quiz.',
    url: 'https://www.uwufufu.com',
    type: 'website',
    images: [
      {
        url: 'https://cdn.uwufufu.com/og_image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UwUFUFU',
    description:
      'Interactive Quizzes. From ideal type world cup to personality quizzes covering categories such as KPOP, Gaming, to food. Try creating your own quiz.',
    images: ['https://cdn.uwufufu.com/og_image.png'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // get accessToken from cookie
  const _cookies = await cookies();
  const localeCookie = _cookies.get('i18next')?.value;

  const locale = languages.includes(localeCookie as string)
    ? localeCookie
    : fallbackLng;

  const token = _cookies.get('accessToken')?.value;
  let user = null;

  // Fetch user on the server
  if (token) {
    try {
      user = await fetchMeSSR(token);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }

  const showAds = !user || user.tier === 'basic';

  // fix this later
  const response = await fetch(`${config.apiUrl}/categories`);
  const categories = await response.json();

  // Define the preloaded state
  const preloadedState = {
    categories: {
      categories, // Pass the categories data to Redux
    },
  };

  return (
    <html lang={locale} dir={dir(locale!)} className="bg-uwu-black">
      <head>
        {/* Google Tag Manager Script */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-PKDH1ZNCFL`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('consent', 'default', {
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                  'analytics_storage': 'denied',
                  'region': ['ES', 'US-AK']
                });

                gtag('config', 'G-PKDH1ZNCFL');
                `,
          }}
        />
        {/* adsense */}
        {/* <script
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1736056775158537"
        ></script> */}
        {showAds ? (
          <script
            async
            crossOrigin="anonymous"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1736056775158537"
          />
        ) : null}
      </head>

      <body className="bg-uwu-black antialiased flex flex-col min-h-viewport">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5B8Q4XN"
            height="0"
            width="0"
            className="hidden"
          ></iframe>
        </noscript>

        <ReduxProvider preloadedState={preloadedState}>
          <StoreInitializer user={user} />
          <Toaster
            toastOptions={{
              success: {
                style: { background: '#00e676', color: '#000' },
                icon: null,
              },
              error: {
                style: { background: '#e73929', color: '#fff' },
                icon: null,
              },
            }}
          />

          {/* ClientTranslationsProvider 내부에서 div가 생기더라도 
             아래 우리가 만든 div가 min-h-screen을 강제하므로 레이아웃이 지켜집니다.
          */}
          <ClientTranslationsProvider initialLocale={locale!}>
            {/* ✅ 여기가 핵심: 모든 UI를 감싸는 Flex 컨테이너 */}
            <div className="flex flex-col w-full bg-uwu-black">
              <Navigation />

              {/* <BannerSlot
                show={showFreeTrial}
                className="w-full"
                reserve="clamp(72px, 10vh, 96px)"
              >
                <FreeTrial user={user} />
              </BannerSlot> */}

              {/* flex-1: 남는 공간을 모두 차지해서 푸터를 바닥으로 밀어냄 */}
              <main className="flex-1 w-full max-w-6xl mx-auto px-2 md:px-0 bg-uwu-black min-h-[80vh]">
                {children}
              </main>

              <Footer />
            </div>
          </ClientTranslationsProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
