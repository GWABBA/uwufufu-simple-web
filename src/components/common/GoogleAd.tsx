// components/common/GoogleAd.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type AdsWindow = Window & { adsbygoogle?: unknown[] };

export default function GoogleAd(props: {
  adSlot: string;
  className?: string;
}) {
  const { adSlot, className } = props;
  const pathname = usePathname();
  const insRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    const init = () => {
      if (cancelled) return;

      const el = insRef.current;
      if (!el) return;

      const w = window as AdsWindow;
      if (!w.adsbygoogle) {
        if (tries < 20) {
          tries += 1;
          setTimeout(init, 150);
        }
        return;
      }

      try {
        w.adsbygoogle.push({});
      } catch {
        if (tries < 20) {
          tries += 1;
          setTimeout(init, 150);
        }
      }
    };

    const timer = setTimeout(init, 50);

    return () => {
      clearTimeout(timer);
      cancelled = true;
    };
  }, [pathname, adSlot]);

  return (
    <ins
      key={`${pathname}-${adSlot}`} // Forces re-mount on route or slot change
      ref={insRef}
      className={`adsbygoogle ${className || ''}`}
      style={{ display: 'block' }}
      data-ad-client="ca-pub-1736056775158537"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
