'use client';

import { resetPassword } from '@/services/auth.service';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface FormValues {
  password: string;
}

export default function PasswordResetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  // ✅ Redirect if no token is present
  useEffect(() => {
    if (!token) {
      router.replace('/auth/login'); // ✅ Use replace instead of push to prevent back navigation
    }
  }, [token, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      await resetPassword(data.password, token!);
      toast.success('Password reset successfully!');
      router.push('/auth/login'); // ✅ This is fine inside an event handler
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
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
          Reset Password
        </h1>
        <div className="pr-2">
          <div className="mb-8">
            <input
              id="password"
              type="password"
              className={`p-2 rounded-md w-full bg-uwu-dark-gray text-white ${
                errors.password ? 'border-red-500 border' : ''
              }`}
              placeholder="Password"
              {...register('password', {
                required: 'Password is required',
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
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
