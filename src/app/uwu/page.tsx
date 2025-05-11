'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-center mt-16 text-white">
        UwUFUFU Universe
      </h1>
      <p className="text-lg text-center text-white">aka UwUverse</p>
      <p className="mt-4 text-lg text-center text-white">
        Check out our affiliated or partner sites.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <Link
          href="https://gayornot.fun"
          className="bg-white/10 rounded-2xl p-6 shadow-lg hover:bg-white/20 transition max-w-[500px] w-full mx-auto cursor-pointer"
          target="_blank"
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).gtag?.('event', 'family_site_click', {
              event_category: 'navigation',
              event_label: 'Gay or Not',
            });
          }}
        >
          <div className="h-[200px] flex items-center justify-center">
            <Image
              src="/assets/logos/gay-or-not-logo-rgb.webp"
              alt="gay-or-not"
              width={320}
              height={100}
              className="w-80 mx-auto"
            />
          </div>
          <h2 className="text-2xl font-semibold text-white text-center">
            Gay or Not
          </h2>
          <p className="mt-2 text-white/80 text-center">
            Vote if something is gay
          </p>
        </Link>

        {/* Card 2 */}
        <Link
          href="https://1sto50.com"
          className="bg-white/10 rounded-2xl p-6 shadow-lg hover:bg-white/20 transition max-w-[500px] w-full mx-auto cursor-pointer"
          target="_blank"
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).gtag?.('event', 'family_site_click', {
              event_category: 'navigation',
              event_label: '1sto50',
            });
          }}
        >
          <div className="h-[200px] flex items-center justify-center">
            <Image
              src="/assets/logos/1to50-logo.png"
              alt="1-50"
              width={160}
              height={60}
              className="w-40 mx-auto"
            />
          </div>
          <h2 className="text-2xl font-semibold text-white text-center">
            1sto50
          </h2>
          <p className="mt-2 text-white/80 text-center">Mini finger game</p>
        </Link>
      </div>
    </div>
  );
}
