'use client';

import { User } from '@/dtos/user.dtos';
import {
  fetchMe,
  sendEmailConfirmationEmail,
  updatedPassword,
  updateUser,
} from '@/services/auth.service';
import { useEffect, useState } from 'react';
import ImageUpload from '@/../public/assets/icons/image-upload.svg';
import Image from 'next/image';
import { uploadImage } from '@/services/images.service';
import toast from 'react-hot-toast';
import { CircleCheckBig } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  cancelSubscription,
  fetchActiveSubscription,
} from '@/services/payment.service';
import Link from 'next/link';
import { PaymentResponseDto } from '@/dtos/payment.dtos';

export default function ProfilePage() {
  const { t } = useTranslation();

  const [user, setUser] = useState<User | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [subscription, setSubscription] = useState<PaymentResponseDto | null>(
    null
  );

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = await fetchMe();
      setUser(user);
      try {
        const subscription = await fetchActiveSubscription();
        setSubscription(subscription);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setSubscription(null);
      }
    };
    fetchUserInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target);
  };

  const handleProfileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'profile');

    setIsUploading(true); // ✅ Show spinner

    try {
      const uploadedImage = await uploadImage(formData);
      setUser({ ...user, profileImage: uploadedImage.url });
      await updateUser({ ...user, profileImage: uploadedImage.url });
      toast.success(t('common.image-uploaded-successfully'));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('common.failed-to-upload-image')
      );
    } finally {
      setIsUploading(false); // ✅ Hide spinner
    }
  };

  const onSavePassword = async () => {
    try {
      await updatedPassword(newPassword);
      toast.success(t('user-profile.password-updated-successfully'));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('user-profile.failed-to-update-password')
      );
    }
  };

  const handleOnSendVerificationEmail = async () => {
    try {
      await sendEmailConfirmationEmail();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('user-profile.failed-to-send-email-verification')
      );
    }
  };

  const handleOnCancelSubscription = async () => {
    const confirmed = confirm(t('user-profile.cancel-subscription-question'));
    if (!confirmed) return;
    try {
      await cancelSubscription();
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : t('user-profile.failed-to-cancel-subscription')
      );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pt-4 md:pt-8 px-2 md:px-0">
      <h1 className="text-xl md:text-4xl font-extrabold text-white mb-4">
        {t('user-profile.user-profile')}
      </h1>

      {/* ✅ Image on top in mobile, side-by-side on desktop */}
      <div className="w-full flex flex-col-reverse md:flex-row gap-4 mx-auto">
        {/* Input Fields (Below image on mobile, next to image on desktop) */}
        <div className="w-full md:w-2/3">
          {/* Email */}
          <div className="mb-8">
            <label
              htmlFor="email"
              className="text-white text-sm md:text-lg block"
            >
              {t('user-profile.email')}
            </label>
            <div className="flex">
              <input
                type="text"
                id="email"
                className="p-2 rounded-md w-full bg-uwu-dark-gray text-white mr-2"
                placeholder="Email"
                disabled
                value={user?.email || ''}
                readOnly
              />
              {user ? (
                user?.isVerified ? (
                  <div className="flex items-center">
                    <div className="text-green-500 flex items-center">
                      <CircleCheckBig
                        size={14}
                        className="text-green-500 mr-1"
                      />
                      <span>{t('user-profile.verified')}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    className="h-10 bg-uwu-red rounded-md text-white px-2 w-36"
                    onClick={handleOnSendVerificationEmail}
                  >
                    {t('user-profile.verify-email')}
                  </button>
                )
              ) : null}
            </div>
          </div>

          {/* Name */}
          <div className="mb-8">
            <label
              htmlFor="name"
              className="text-white text-sm md:text-lg block"
            >
              {t('user-profile.name')}
            </label>
            <input
              type="text"
              id="name"
              className="p-2 rounded-md w-full bg-uwu-dark-gray text-white"
              placeholder="Name"
              value={user?.name || ''}
              onChange={handleInputChange}
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label
              htmlFor="newPassword"
              className="text-white text-sm md:text-lg block"
            >
              {t('user-profile.change-password')}
            </label>

            <input
              type="password"
              id="newPassword"
              className="p-2 rounded-md w-full bg-uwu-dark-gray text-white mb-4"
              placeholder="New Password"
              value={t('user-profile.new-password')}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="h-10 bg-uwu-red rounded-md text-white px-2"
                onClick={onSavePassword}
              >
                {t('user-profile.save-password')}
              </button>
            </div>
          </div>

          {/* subscription */}
          <div className="mb-8">
            <label
              htmlFor="subscription"
              className="text-white text-sm md:text-lg block"
            >
              {t('user-profile.subscription')}
            </label>
            <div className="flex justify-between">
              <div>
                {/* capitalize first letter */}
                <p className="text-white text-sm md:text-lg font-bold mr-4">
                  {user && user.tier
                    ? user.tier.charAt(0).toUpperCase() + user.tier.slice(1)
                    : ''}
                </p>
                {user && user.tier !== 'basic' && (
                  <p className="text-white">
                    {' '}
                    until{' '}
                    {user && user.subscriptionEndDate?.toString().split('T')[0]}
                  </p>
                )}
              </div>
              {subscription ? (
                <div
                  className="text-uwu-gray underline cursor-pointer"
                  onClick={handleOnCancelSubscription}
                >
                  {t('user-profile.cancel-subscription')}
                </div>
              ) : (
                <button>
                  <Link href="/plans" className="text-white underline">
                    {t('user-profile.upgrade-subscription')}
                  </Link>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Image Section (Above inputs on mobile, beside on desktop) */}
        <div className="w-full md:w-1/3">
          <div className="mb-8">
            <label htmlFor="profileImage" className="text-white text-lg block">
              {t('user-profile.profile-image')}
            </label>
            <div className="relative w-full aspect-video flex items-center justify-center bg-uwu-dark-gray rounded-md overflow-hidden cursor-pointer">
              {/* ✅ Show Spinner when Uploading */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full"></div>
                </div>
              )}

              {/* ✅ Show Uploaded Image or Default Icon */}
              {user?.profileImage ? (
                <Image
                  src={user?.profileImage}
                  alt="Profile Image"
                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                  width={568}
                  height={230}
                />
              ) : (
                <div className="text-white flex flex-col items-center">
                  <ImageUpload className="w-12 h-12" />
                  <p className="text-sm mt-2">
                    {t('user-profile.upload-an-image')}
                  </p>
                </div>
              )}

              {/* ✅ Hidden File Input */}
              <input
                type="file"
                id="profileImage"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleProfileImageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
