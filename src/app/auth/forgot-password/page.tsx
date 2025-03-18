'use client';

import { createPasswordReset } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface FormValues {
  email: string;
}

export default function ForgotPassword() {
  const { t } = useTranslation();

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createPasswordReset(data);
      toast.success(t('auth.check-email'));
      router.push('/auth/login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('auth.unknown-error-occurred'));
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
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
          {t('auth.find-password')}
        </h1>
        <p className="text-white text-sm mb-4">{t('auth.enter-email')}</p>

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
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-uwu-red py-2 px-4 rounded-lg cursor-pointer text-white w-full"
          >
            {t('auth.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
