'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  const pathname = usePathname();
  if (pathname === '/' || pathname === '/my/plays') {
    return null;
  }

  return (
    <footer className="w-full mt-auto bg-uwu-black border-t border-uwu-gray text-white px-2 md:px-0 py-3">
      <div className="max-w-6xl mx-auto">
        {/* Discord Link */}
        <div className="md:flex md:justify-start mb-2">
          <div className="flex justify-center md:block mb-2 md:mb-0">
            <Link href="/terms-of-service" className="md:mr-8 underline">
              Terms of Service
            </Link>
          </div>
          <div className="flex justify-center md:block mb-2 md:mb-0">
            <Link href="/terms-of-service" className="md:mr-8 underline">
              Privacy Policy
            </Link>
          </div>
          <div className="flex justify-center md:block md:mb-0">
            <a
              href="https://discord.gg/4t8vZ6b"
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer"
            >
              <Image
                className="mr-2"
                src="/assets/social-medias/share_discord.svg"
                alt="Discord"
                width={24}
                height={24}
              />
              <span>{t('footer.join-discord')}</span>
              <span className="mr-1 block">👋</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
