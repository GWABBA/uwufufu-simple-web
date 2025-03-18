'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { fetchMe, register as registerService } from '@/services/auth.service';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { setUser } from '@/store/slices/auth.reducer';
import { useAppDispatch } from '@/store/hooks';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

interface FormValues {
  email: string;
  password: string;
  name: string;
}

export default function Register() {
  const { t } = useTranslation();

  const appDispatch = useAppDispatch();
  const searchParams = useSearchParams(); // Get query params
  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    setRedirectUrl(searchParams.get('redirect')); // ✅ Only runs on client-side
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await registerService(data);
      const user = await fetchMe();
      appDispatch(setUser(user));
      toast.success(t('auth.welcome-back'));

      if (redirectUrl) {
        router.push(redirectUrl);
        return;
      }
      router.push('/');
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
          {t('auth.sign-up')}
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

          {/* name */}
          <div className="mb-8">
            {/* <label htmlFor="name" className="text-white text-lg block">
              Name
            </label> */}
            <input
              type="name"
              id="name"
              className={`p-2 rounded-md w-full bg-uwu-dark-gray text-white ${
                errors.name ? 'border-red-500 border' : ''
              }`}
              placeholder={t('auth.what-do-you-want-to-be-called')}
              {...register('name', {
                required: t('auth.name-is-required'),
                minLength: {
                  value: 4,
                  message: t('auth.name-3-20-characters'),
                },
                maxLength: {
                  value: 20,
                  message: t('auth.name-3-20-characters'),
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
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
          <Trans i18nKey="already-registered">
            Already registered?{' '}
            <Link
              href={`/auth/login?${
                redirectUrl ? `redirect=${encodeURIComponent(redirectUrl)}` : ''
              }`}
              className="text-uwu-red"
            >
              Log in
            </Link>{' '}
            now.
          </Trans>
        </div>
      </form>
    </div>
  );
}
