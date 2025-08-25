'use client';

import { useEffect, useState } from 'react';
import { fetchLatestPayment as fetchLatestPaymentService } from '@/services/payment.service';
import { User } from '@/dtos/user.dtos';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function FreeTrialBanner({ user }: { user: User | null }) {
  const { t } = useTranslation();

  const [latestPaymentExists, setLatestPaymentExists] =
    useState<boolean>(false);
  const [latestPaymentFetched, setLatestPaymentFetched] =
    useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setLatestPaymentExists(false);
      return;
    }

    const fetchLatestPayment = async () => {
      try {
        await fetchLatestPaymentService();
        setLatestPaymentExists(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setLatestPaymentExists(false);
      } finally {
        setLatestPaymentFetched(true);
      }
    };

    fetchLatestPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!latestPaymentFetched) return null; // Ensure API has finished fetching
  if (latestPaymentExists) return null; // Hide if user has already paid

  return (
    <Link href="/plans" className="cursor-pointer">
      <div className="w-full bg-yellow-200 flex justify-center">
        <div className="max-w-6xl w-full py-2 flex items-center text-uwu-red justify-center text-center">
          {/* Single line text for `md` and above */}
          <span className="hidden md:inline">
            {t('banner.good-stuff')}
            <span className="font-bold ml-1">{t('banner.go-premium')}</span>
          </span>

          {/* Two-line text for smaller screens */}
          <span className="md:hidden block">
            {t('banner.good-stuff')} <br />
            <span className="font-bold">{t('banner.go-premium')}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
