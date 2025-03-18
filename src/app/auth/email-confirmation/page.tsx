'use client';

import LoadingAnimation from '@/components/animation/Loading';
import { verifyEmail } from '@/services/auth.service';
import { useAppSelector } from '@/store/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function EmailConfirmationPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token'); // ✅ Extract token
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (token && user) {
      const requireEmailVerification = async () => {
        try {
          await verifyEmail(token); // ✅ Verify email
          toast.success(t('auth.email-confirm-successfully'));
          router.push('/');
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : t('auth.failed-to-send-email')
          );
        }
      };
      requireEmailVerification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div>
      <LoadingAnimation></LoadingAnimation>
    </div>
  );
}
