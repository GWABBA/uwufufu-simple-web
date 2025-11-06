'use client';

import LoadingAnimation from '@/components/animation/Loading';
import { fetchMe, verifyEmail } from '@/services/auth.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.reducer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// import { fetchMe } from '@/store/slices/auth.reducer'; // optional

export default function EmailConfirmationPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const appDispatch = useAppDispatch();
  const router = useRouter();
  const token = searchParams.get('token');
  const user = useAppSelector((state) => state.auth.user);

  const ranRef = useRef(false);

  useEffect(() => {
    if (!token || ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        await verifyEmail(token);

        // Option A: re-fetch user from server
        // await appDispatch(fetchMe());

        // Option B: just update locally
        const user = await fetchMe();
        appDispatch(setUser(user));

        toast.success(t('auth.email-confirm-successfully'));
        router.replace('/');
      } catch (error: unknown) {
        // ✅ typed catch block
        let message = t(
          'auth.failed-to-send-email',
          'Failed to confirm your email.'
        );

        if (error instanceof Error) {
          message = error.message;
        } else if (
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message?: string }).message === 'string'
        ) {
          message = (error as { message: string }).message;
        }

        toast.error(message);
        router.replace('/');
      }
    })();
  }, [token, appDispatch, router, t, user]);

  return (
    <div>
      <LoadingAnimation />
    </div>
  );
}
