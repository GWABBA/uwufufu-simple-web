'use client';

import { RootState } from '@/store/store';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import Image from 'next/image';
import ImageUpload from '@/../public/assets/icons/image-upload.svg';
import { Locales, Visibility } from '@/enums/enums.enum';
import { createWorldcup } from '@/services/worldcup.service';
import { Worldcup } from '@/dtos/worldcup.dtos';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { uploadImage } from '@/services/images.service';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

interface FormValues {
  title: string;
  description: string;
  visibility: string;
  categoryId: number;
  isNsfw: boolean;
  coverImage: string;
  locale: Locales;
}

const CreateGame = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );

  useEffect(() => {
    const token = Cookies.get('accessToken'); // ✅ Read the cookie in client-side

    if (!token) {
      toast.error(t('common.you-need-to-login-first'));
      router.replace('/auth/login?redirect=/create-game');
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      visibility: Visibility.IsClosed,
      categoryId: categories[0]?.id,
      isNsfw: false,
      coverImage: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const worldcupPayload: Worldcup = {
      id: 0, // Or generate it dynamically if needed
      title: data.title,
      description: data.description,
      visibility: data.visibility as Visibility,
      categoryId: Number(data.categoryId),
      coverImage: data.coverImage,
      locale: data.locale,
      isNsfw: data.isNsfw,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const newWorldcupData = await createWorldcup(worldcupPayload);
      toast.success(t('create-worldcup.worldcup-created-successfully'));
      router.push(`/create-game/${newWorldcupData.id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('common.unknown-error-occurred'));
      }
    }
  };

  const handleCoverImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'cover');

    setIsUploading(true); // ✅ Show spinner

    try {
      const uploadedImage = await uploadImage(formData);
      setValue('coverImage', uploadedImage.url);
      setCoverImagePreview(uploadedImage.url); // ✅ Show uploaded image
      toast.success(t('common.image-uploaded-successfully'));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('common.unknown-error-occurred')
      );
    } finally {
      setIsUploading(false); // ✅ Hide spinner
    }
  };

  if (isLoading) {
    return <div />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-4xl mx-auto pt-4 md:pt-8 px-2 md:px-0 mb-12"
    >
      <div>
        <h1 className="text-xl md:text-4xl font-bold text-white mb-8">
          {t('create-worldcup.create-worldcup')}
        </h1>
        {/* Title */}
        <div className="mb-8">
          <label htmlFor="title" className="text-white text-lg block">
            {t('create-worldcup.title')}
          </label>
          <input
            type="text"
            id="title"
            className={`p-2 rounded-md w-full bg-uwu-dark-gray text-white ${
              errors.title ? 'border-red-500 border' : ''
            }`}
            placeholder="Title"
            {...register('title', {
              required: t('create-worldcup.title-is-required'),
            })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-8">
          <label htmlFor="description" className="text-white text-lg block">
            {t('create-worldcup.description')}
          </label>
          <textarea
            id="description"
            className={`p-2 rounded-md w-full bg-uwu-dark-gray text-white ${
              errors.description ? 'border-red-500 border' : ''
            }`}
            placeholder="Description"
            {...register('description', {
              required: t('create-worldcup.description-is-required'),
            })}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        {/* Cover Image */}
        <div className="mb-8">
          <label htmlFor="coverImage" className="text-white text-lg block">
            {t('create-worldcup.cover-image')}
          </label>
          <div className="flex justify-center">
            <div className="relative w-full h-60 flex items-center justify-center bg-uwu-dark-gray rounded-md overflow-hidden cursor-pointer">
              {/* ✅ Show Spinner when Uploading */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full"></div>
                </div>
              )}

              {/* ✅ Show Uploaded Image (Fully Covered) or Default Icon */}
              {coverImagePreview ? (
                <Image
                  src={coverImagePreview}
                  alt="Cover Image"
                  className="rounded-md max-w-80"
                  width={568}
                  height={230}
                />
              ) : (
                <div className="text-white flex flex-col items-center">
                  <ImageUpload className="w-12 h-12" />
                  <p className="text-sm mt-2">
                    {t('create-worldcup.upload-image')}
                  </p>
                </div>
              )}

              {/* ✅ Hidden File Input (Still Clickable) */}
              <input
                type="file"
                id="coverImage"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleCoverImageChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-uwu-red py-2 px-4 rounded-lg cursor-pointer text-white max-w-full"
        >
          {t('create-worldcup.choices')} {'>'}
        </button>
      </div>
    </form>
  );
};

export default CreateGame;
