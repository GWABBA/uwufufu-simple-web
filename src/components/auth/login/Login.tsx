'use client';

import { fetchMe, login } from '@/services/auth.service';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.reducer';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

interface FormValues {
  email: string;
  password: string;
}

export default function Login() {
  const { t } = useTranslation();

  const appDispatch = useAppDispatch();
  const searchParams = useSearchParams(); // Get query params
  const pathname = usePathname();
  const router = useRouter();

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    setRedirectUrl(searchParams.get('redirect')); // ✅ Only runs on client-side
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const message = searchParams.get('toastMessage');
      if (message) {
        toast.error(decodeURIComponent(message)); // ✅ Show toast on client

        // ✅ Create a new URL without the toastMessage parameter
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('toastMessage');

        // ✅ Replace the URL without reloading the page
        router.replace(`${pathname}?${newParams.toString()}`);
      }
    }
  }, [searchParams, pathname, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data);
      const user = await fetchMe();
      appDispatch(setUser(user));
      toast.success(t('auth.welcome-back'));

      if (redirectUrl) {
        router.push(redirectUrl);
        return;
      }
      router.push('/'); // Redirect after successful login
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('common.unknown-error-occurred'));
      }
    }
  };

  return (
    <div className="flex justify-center">
      <form
        className="w-full max-w-md p-4 mt-16"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <h1 className="text-xl md:text-2xl font-bold text-white mb-4">
          {t('auth.login')}
        </h1>
        <div className="pr-2">
          {/* Title */}
          <div className="mb-8">
            {/* <label htmlFor="email" className="text-white text-lg block">
              Email
            </label> */}
            <input
              type="email"
              id="email"
              className={`p-2 rounded-md w-full bg-uwu-dark-gray text-white ${
                errors.email ? 'border-red-500 border' : ''
              }`}
              placeholder={t('auth.email')}
              {...register('email', {
                required: t('auth.email-is-required'),
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: t('auth.email-is-invalid'),
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-8">
            {/* <label htmlFor="password" className="text-white text-lg block">
              Password
            </label> */}
            <input
              id="password"
              type="password"
              className={`p-2 rounded-md w-full bg-uwu-dark-gray text-white ${
                errors.password ? 'border-red-500 border' : ''
              }`}
              placeholder={t('auth.password')}
              {...register('password', {
                required: t('auth.password-is-required'),
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-uwu-red py-2 px-4 rounded-lg cursor-pointer text-white w-full"
          >
            {t('auth.submit')}
          </button>
        </div>

        <div className="text-gray-300 mt-4">
          <Trans i18nKey="auth.not-registered">
            Not registered yet?
            <Link
              href={`/auth/register?${
                redirectUrl ? `redirect=${encodeURIComponent(redirectUrl)}` : ''
              }`}
              className="text-uwu-red"
            >
              Sign up
            </Link>
            now.
          </Trans>
        </div>

        {/* Forgot password */}
        <div className="text-gray-300 mt-2">
          <Trans i18nKey="auth.forgot-password">
            Click{' '}
            <Link href="/auth/forgot-password" className="text-uwu-red">
              here
            </Link>{' '}
            to find your password.
          </Trans>
        </div>
      </form>
    </div>
  );
}
