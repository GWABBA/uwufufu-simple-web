import { useState } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/services/images.service';
import toast from 'react-hot-toast';
import { Image as LucideImage } from 'lucide-react';
import { Worldcup } from '@/dtos/worldcup.dtos';
import { MainTabsType } from '@/enums/enums.enum';
import { useTranslation } from 'react-i18next';

interface CoverComponentProps {
  game: Worldcup;
  onUpdateGame: (updatedFields: Partial<Worldcup>) => void;
  onSetMainTab: (mainTabType: MainTabsType) => void;
}

export default function CoverComponent({
  game,
  onUpdateGame,
  onSetMainTab,
}: CoverComponentProps) {
  const { t } = useTranslation();

  const [isUploading, setIsUploading] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    onUpdateGame({ [id]: value }); // Update parent game state
  };

  const handleCoverImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true); // Show spinner

    // Create FormData with file and type
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'cover'); // Example type, change if needed

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // ✅ Upload the image
      const uploadedImage = await uploadImage(formData);
      onUpdateGame({ coverImage: uploadedImage.url });

      toast.success(t('create-worldcup.image-uploaded-successfully'));
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('create-worldcup.failed-to-upload-image')
      );
    } finally {
      setIsUploading(false); // Hide spinner
    }
  };

  return (
    <div className="mb-8">
      {/* Title */}
      <div className="mb-8">
        <label htmlFor="title" className="text-white text-lg block">
          {t('create-worldcup.title')}
        </label>
        <input
          type="text"
          id="title"
          className="p-2 rounded-md w-full bg-uwu-dark-gray text-white"
          placeholder="Title"
          value={game?.title || ''}
          onChange={handleInputChange}
        />
      </div>
      {/* Description */}
      <div className="mb-8">
        <label htmlFor="description" className="text-white text-lg block">
          {t('create-worldcup.description')}
        </label>
        <textarea
          id="description"
          className="p-2 rounded-md w-full bg-uwu-dark-gray text-white"
          placeholder="Description"
          value={game?.description || ''}
          onChange={handleInputChange}
        />
      </div>

      {/* Cover Image */}
      <div>
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

            {/* ✅ Show Uploaded Image ONLY when available */}
            {coverImagePreview || game?.coverImage ? (
              <Image
                src={
                  coverImagePreview ?? game?.coverImage ?? '/default-cover.jpg'
                } // ✅ Ensure fallback
                alt="Cover Image"
                width={1200}
                height={800}
                objectFit="cover"
                className="rounded-md max-w-80"
              />
            ) : (
              <div className="text-white flex flex-col items-center justify-center">
                <LucideImage size={86} className="text-white" />
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

      <div className="flex justify-end mt-8">
        <button
          className="bg-uwu-red py-2 px-4 rounded-lg cursor-pointer text-white"
          onClick={() => onSetMainTab(MainTabsType.SELECTIONS)}
        >
          {t('create-worldcup.choices')} {'>'}
        </button>
      </div>
    </div>
  );
}
