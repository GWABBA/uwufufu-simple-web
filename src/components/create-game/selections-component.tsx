import { SelectionDto } from '@/dtos/selection.dtos';
import { Worldcup } from '@/dtos/worldcup.dtos';
import {
  createSelectionWithImage,
  createSelectionWithVideo,
  deleteSelection,
  fetchSelectionsForEdit,
  updateSelection,
} from '@/services/selections.service';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { MainTabsType } from '@/enums/enums.enum';
import {
  TvMinimalPlay,
  Images,
  Image as LucidImage,
  Pencil,
  Trash2,
  Save,
} from 'lucide-react';
import Pagination from '../common/Pagination';
import { useTranslation } from 'react-i18next';
import { uploadImage } from '@/services/images.service';

interface SelectionsComponentProps {
  game: Worldcup;
  onSetMainTab: (mainTabType: MainTabsType) => void;
}

enum SelectionTabType {
  IMAGE = 'image',
  VIDEO = 'video',
}

type SortOption = 'name' | 'createdAt' | 'winLossRatio' | 'finalWinLossRatio';

type UploadErrorItem = {
  fileName: string;
  error: string;
};

const MAX_SELECTION_IMAGE_SIZE_BYTES = 12 * 1024 * 1024;
const ALLOWED_SELECTION_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

export default function SelectionsComponent({
  game,
  onSetMainTab,
}: SelectionsComponentProps) {
  const { t } = useTranslation();

  const [tab, setTab] = useState<SelectionTabType>(SelectionTabType.IMAGE);

  const perPage = 10;
  const [selections, setSelections] = useState<SelectionDto[]>([]);
  const [selectionsCount, setSelectionsCount] = useState(0);
  const [page, setPage] = useState(1);

  const [isUploadingSelectionImages, setIsUploadingSelectionImages] =
    useState(false);
  const [uploadErrors, setUploadErrors] = useState<UploadErrorItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  }>({
    current: 0,
    total: 0,
  });

  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [changedSelectionImage, setChangedSelectionImage] = useState<{
    [key: number]: string;
  }>({});
  const [selectionIsUploading, setSelectionIsUploading] = useState<{
    [key: number]: boolean;
  }>({});
  const [brokenSelectionImages, setBrokenSelectionImages] = useState<{
    [key: number]: boolean;
  }>({});

  const [newName, setNewName] = useState<{ [key: number]: string }>({});
  const [newVideo, setNewVideo] = useState<{
    [key: number]: { videoUrl: string; startTime: number; endTime: number };
  }>({});

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const fetchSelections = async () => {
    const selections = await fetchSelectionsForEdit({
      worldcupId: game.id,
      page,
      perPage,
      keyword: searchKeyword,
      sortBy,
    });
    setSelections(selections.data);
    setSelectionsCount(selections.total);
  };

  useEffect(() => {
    if (!game) return;
    fetchSelections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy]);

  const getFriendlyUploadError = (rawMessage: string) => {
    const message = rawMessage.toLowerCase();

    if (
      message.includes('unsupported file type') ||
      message.includes('invalid file type')
    ) {
      return 'Unsupported file type. Use JPG, PNG, GIF, or WEBP.';
    }

    if (
      message.includes('file too large') ||
      message.includes('limit file size')
    ) {
      return 'File is too large. Maximum size is 12 MB.';
    }

    if (
      message.includes('image dimensions are too large') ||
      message.includes('pixel limit')
    ) {
      return 'Image dimensions are too large. Please upload a smaller image.';
    }

    if (message.includes('no file uploaded')) {
      return 'No file was uploaded. Choose an image and try again.';
    }

    if (
      message.includes('upload service is temporarily unavailable') ||
      message.includes('failed to upload file')
    ) {
      return 'Upload service is temporarily unavailable. Try again in a moment.';
    }

    if (message.includes('game not found')) {
      return 'This worldcup could not be found. Refresh the page and try again.';
    }

    if (message.includes('network error')) {
      return 'Network error while uploading. Check your connection and try again.';
    }

    return 'Upload failed unexpectedly. Try again.';
  };

  const handleSelectionImagesChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputElement = event.target; // Get the input element
    const files = inputElement.files;
    if (!files || files.length === 0) return;

    onSetMainTab(MainTabsType.SELECTIONS);
    setUploadErrors([]);
    setIsUploadingSelectionImages(true); // Show spinner
    setUploadProgress({ current: 0, total: files.length });

    try {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const clientValidationErrors: UploadErrorItem[] = [];

      for (const file of fileArray) {
        if (!ALLOWED_SELECTION_IMAGE_TYPES.has(file.type)) {
          clientValidationErrors.push({
            fileName: file.name,
            error: 'Unsupported file type. Use JPG, PNG, GIF, or WEBP.',
          });
          continue;
        }

        if (file.size > MAX_SELECTION_IMAGE_SIZE_BYTES) {
          clientValidationErrors.push({
            fileName: file.name,
            error: 'File is too large. Maximum size is 12 MB.',
          });
          continue;
        }

        validFiles.push(file);
      }

      const chunkSize = 10;
      const chunks = [];

      for (let i = 0; i < validFiles.length; i += chunkSize) {
        chunks.push(validFiles.slice(i, i + chunkSize));
      }

      const newSelections: SelectionDto[] = [];
      const newUploadErrors: UploadErrorItem[] = [...clientValidationErrors];
      let completedUploads = clientValidationErrors.length;

      if (completedUploads > 0) {
        setUploadProgress({ current: completedUploads, total: fileArray.length });
      }

      for (const batch of chunks) {
        const uploadPromises = batch.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'selection');
          formData.append('worldcupId', String(game?.id));

          try {
            const uploadedSelection = await createSelectionWithImage(formData);
            newSelections.push(uploadedSelection!); // ✅ Push to local array
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? getFriendlyUploadError(error.message)
                : 'Upload failed unexpectedly. Try again.';
            newUploadErrors.push({ fileName: file.name, error: errorMessage }); // ✅ Push to local array
          } finally {
            completedUploads += 1;
            setUploadProgress({
              current: completedUploads,
              total: fileArray.length,
            });
          }
        });

        await Promise.all(uploadPromises); // Wait for batch completion
      }
      setUploadErrors(newUploadErrors);
      onSetMainTab(MainTabsType.SELECTIONS);

      if (newUploadErrors.length > 0) {
        if (newSelections.length > 0) {
          toast.success(`${newSelections.length} image(s) uploaded successfully`);
        }
        toast.error(
          `${newUploadErrors.length} image(s) failed to upload. See details below.`
        );
      }

      if (newUploadErrors.length === 0 && newSelections.length > 0) {
        toast.success(t('common.images-uploaded-successfully'));
      }

      if (newSelections.length > 0) {
        setPage(1);
        const selections = await fetchSelectionsForEdit({
          worldcupId: game.id,
          page: 1,
          perPage,
          sortBy,
        });
        setSelections(selections.data);
        setSelectionsCount(selections.total);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? getFriendlyUploadError(error.message)
          : 'Upload failed unexpectedly. Try again.'
      );
    } finally {
      setIsUploadingSelectionImages(false); // Hide spinner
      setUploadProgress({ current: 0, total: 0 });

      // ✅ Clear the file input field (important)
      inputElement.value = ''; // Reset the input field
    }
  };

  const handleDeleteSelection = async (selectionId: number) => {
    // ✅ If visibility is Public and deleting would leave fewer than 4 selections
    // if (game?.visibility === Visibility.IsPublic && selectionsCount <= 4) {
    //   toast.error(t('create-worldcup.public-needs-4'));
    //   return; // ⛔ Prevent deletion
    // }

    const confirmDelete = window.confirm(
      t('create-worldcup.are-you-sure-you-want-to-delete-selection')
    );
    if (!confirmDelete) return; // Cancel deletion if user clicks "No"

    try {
      await deleteSelection(selectionId); // Call API to delete
      setSelections((prev) => prev.filter((s) => s.id !== selectionId)); // Remove from state
      setSelectionsCount((prev) => prev - 1);
      const selections = await fetchSelectionsForEdit({
        worldcupId: game.id,
        page,
        perPage,
        sortBy,
      });
      setSelections(selections.data);
      setSelectionsCount(selections.total);
      toast.success(t('create-worldcup.selection-deleted-successfully'));
    } catch (error) {
      console.error(
        `${t('create-worldcup.failed-to-delete-selection')}:`,
        error
      );
      toast.error(t('create-worldcup.failed-to-delete-selection'));
    }
  };

  const handleEditClick = (selection: SelectionDto) => {
    setEditMode((prev) => ({ ...prev, [selection.id]: true }));
    setNewName((prev) => ({ ...prev, [selection.id]: selection.name }));

    if (selection?.isVideo) {
      setNewVideo((prev) => ({
        ...prev,
        [selection.id]: {
          videoUrl: selection.videoUrl || '',
          startTime: selection.startTime ?? 0,
          endTime: selection.endTime ?? 0,
        },
      }));
    }
  };

  const handleOnYoutubeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!youtubeUrl) return;

      const selection = {
        worldcupId: game.id,
        resourceUrl: youtubeUrl,
        startTime,
        endTime,
      };

      const newSelection = await createSelectionWithVideo(selection);
      setSelections((prev) => [newSelection!, ...prev]);
      setYoutubeUrl('');
      setStartTime(0);
      setEndTime(0);
      toast.success(t('create-worldcup.youtube-video-uploaded-successfully'));
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error
          ? e.message
          : t('create-worldcup.failed-to-update-selection-name')
      );
    }
  };

  const handleSave = async (selection: SelectionDto) => {
    try {
      const updatedSelection = await updateSelection({
        gameId: game.id,
        selectionId: selection.id,
        name: newName[selection.id] || selection.name,
        resourceUrl:
          changedSelectionImage[selection.id] ||
          selection.resourceUrl ||
          undefined,
        videoUrl: newVideo[selection.id]?.videoUrl ?? selection.videoUrl ?? undefined,
        startTime: newVideo[selection.id]?.startTime ?? selection.startTime,
        endTime: newVideo[selection.id]?.endTime ?? selection.endTime,
      });
      setSelections((prev) =>
        prev.map((s) => (s.id === selection.id ? updatedSelection! : s))
      );
      setEditMode((prev) => ({ ...prev, [selection.id]: false }));
      setChangedSelectionImage((prev) => ({ ...prev, [selection.id]: '' }));
      toast.success(t('create-worldcup.selection-name-updated-successfully'));
    } catch (e) {
      console.error(e);
    }
  };

  const searchSelections = async () => {
    setPage(1);
    await fetchSelections();
  };

  const handleEditSelectionImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    selectionId: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'cover');

    setSelectionIsUploading((prev) => ({ ...prev, [selectionId]: true }));

    try {
      const uploadedImage = await uploadImage(formData);
      setBrokenSelectionImages((prev) => ({ ...prev, [selectionId]: false }));
      setChangedSelectionImage(
        (prev) => ({ ...prev, [selectionId]: uploadedImage.url }) // ✅ Show uploaded image
      );
      toast.success(t('common.image-uploaded-successfully'));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('common.unknown-error-occurred')
      );
    } finally {
      setSelectionIsUploading(
        (prev) => ({ ...prev, [selectionId]: false }) // ✅
      ); // ✅ Hide spinner
    }
  };

  const hasValidImageSource = (src?: string | null) => {
    if (!src) return false;

    const normalizedSrc = src.trim();
    if (!normalizedSrc) return false;

    return (
      normalizedSrc.startsWith('http://') ||
      normalizedSrc.startsWith('https://') ||
      normalizedSrc.startsWith('/') ||
      normalizedSrc.startsWith('data:image/')
    );
  };

  const renderSelectionImagePlaceholder = () => (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-black/20 text-white">
      <LucidImage size={40} />
      <p className="mt-2 text-sm text-gray-300">
        {t('create-worldcup.upload-image')}
      </p>
    </div>
  );

  const isYouTubeSelection = (selection: SelectionDto) =>
    selection.videoSource === 'youtube' &&
    hasValidImageSource(selection.videoUrl);

  return (
    <div>
      {/* pick selection type */}
      <div className="mb-6">
        <div className="text-white">{t('create-worldcup.type')}</div>
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div
            className={`flex justify-center items-center border rounded-md h-40 md:h-60 cursor-pointer ${
              tab === SelectionTabType.IMAGE
                ? 'border-uwu-red text-uwu-red'
                : 'border-uwu-gray text-uwu-gray'
            }`}
            onClick={() => setTab(SelectionTabType.IMAGE)}
          >
            <div>
              <div className="flex justify-center">
                <Images className="hidden md:block" size={64} />
                <Images className="visible md:hidden" size={40} />
              </div>
              <div className="text-center text-lg">
                {t('create-worldcup.image')}
              </div>
            </div>
          </div>
          <div
            className={`flex justify-center items-center border rounded-md h-40 md:h-60 cursor-pointer ${
              tab === SelectionTabType.VIDEO
                ? 'border-uwu-red text-uwu-red'
                : 'border-uwu-gray text-uwu-gray'
            }`}
            onClick={() => setTab(SelectionTabType.VIDEO)}
          >
            <div>
              <div>
                <TvMinimalPlay className="hidden md:block" size={64} />
                <TvMinimalPlay className="visible md:hidden" size={40} />
              </div>
              <div className="text-center text-lg">
                {t('create-worldcup.video')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* create selections */}
      {tab === SelectionTabType.IMAGE ? (
        <>
          <label className="text-white block">
            {t('create-worldcup.upload-images')}
          </label>
          <div className="mb-8">
            {/* upload images */}
            <div className="relative w-full h-32 md:h-48 flex items-center justify-center bg-uwu-dark-gray rounded-md overflow-hidden cursor-pointer">
              {/* ✅ Show Spinner when Uploading */}
              {isUploadingSelectionImages ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="flex flex-col items-center gap-3 text-white">
                    <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full"></div>
                    <p className="text-sm">
                      Uploading {uploadProgress.current} of {uploadProgress.total}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-white flex flex-col items-center justify-center">
                  {/* <ImageUpload className="w-12 h-12" /> */}
                  <LucidImage size={48} />
                  <p className="text-sm mt-2">
                    Drag and drop or click to upload images (12mb max)
                  </p>
                </div>
              )}

              {/* ✅ Hidden File Input (Still Clickable) */}
              <input
                type="file"
                multiple
                id="coverImage"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleSelectionImagesChange}
              />
            </div>

            {uploadErrors.length > 0 && (
              <div className="mt-4 rounded-md border border-red-500/40 bg-red-950/30 p-4">
                <div className="text-sm font-semibold text-red-200">
                  Upload issues
                </div>
                <div className="mt-2 space-y-2">
                  {uploadErrors.map((uploadError, index) => (
                    <div
                      key={`${uploadError.fileName}-${index}`}
                      className="rounded bg-black/20 px-3 py-2 text-sm text-red-100"
                    >
                      <div className="font-medium break-all">
                        {uploadError.fileName}
                      </div>
                      <div className="text-red-200/90">{uploadError.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <label className="text-white text-lg block">
            {t('create-worldcup.youtube-url')}
          </label>
          <div className="mb-8">
            <form
              onSubmit={handleOnYoutubeSubmit}
              className="flex flex-col md:flex-row md:space-x-2 space-y-4 md:space-y-0 w-full"
            >
              {/* ✅ YouTube URL Input (STRETCHES MORE) */}
              <input
                type="text"
                id="youtubeUrl"
                className="p-2 rounded-md bg-uwu-dark-gray text-white w-full md:flex-[2]"
                placeholder={t('create-worldcup.youtube-url')}
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />

              {/* ✅ Start & End Time Inputs (STRETCHED) */}
              <input
                type="number"
                id="startTime"
                className="p-2 rounded-md bg-uwu-dark-gray text-white w-full md:flex-1"
                placeholder="Start (s)"
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                min={0}
              />

              <input
                type="number"
                id="endTime"
                className="p-2 rounded-md bg-uwu-dark-gray text-white w-full md:flex-1"
                placeholder="End (s)"
                value={endTime}
                onChange={(e) => setEndTime(Number(e.target.value))}
                min={0}
              />

              {/* ✅ Submit Button (STRETCHED) */}
              <button
                type="submit"
                className="p-2 bg-uwu-red text-white rounded-md hover:bg-blue-600 transition w-full md:flex-1"
              >
                + {t('create-worldcup.add')}
              </button>
            </form>
            <div className="text-white text-sm">
              {t('create-worldcup.input-video-url')}
            </div>
          </div>
        </>
      )}

      {/* selections */}
      <div>
        <label className="text-white block">
          {t('create-worldcup.choices')}
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault(); // ✅ Prevents page refresh
            searchSelections(); // ✅ Calls the search function
          }}
          className="flex items-center mb-4"
        >
          <input
            type="text"
            className="rounded-l-md w-full bg-uwu-dark-gray text-white px-2 h-10"
            placeholder="Search by name"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button
            type="submit" // ✅ Triggers onSubmit when Enter is pressed
            className="bg-uwu-red text-white rounded-r-md py-2 px-8 h-10"
          >
            {t('create-worldcup.search')}
          </button>
        </form>

        <div className="flex justify-end">
          <select
            name="sortBy"
            id="sortBy"
            className="rounded-l-md bg-uwu-dark-gray text-white px-2 h-10 mb-4 cursor-pointer"
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="name">Sort by Name</option>
            <option value="createdAt">Sort by Created</option>
            <option value="winLossRatio">Sort by Win Ratio</option>
            <option value="finalWinLossRatio">Sort by Champ. Ratio</option>
          </select>
        </div>

        {selections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selections.map((selection) => {
              const winRatio =
                selection.wins + selection.losses > 0
                  ? (selection.wins / (selection.wins + selection.losses)) * 100
                  : 0;
              const championshipRatio =
                selection.finalWins + selection.finalLosses > 0
                  ? (selection.finalWins /
                      (selection.finalWins + selection.finalLosses)) *
                    100
                  : 0;

              return (
                <div
                  key={selection.id}
                  className="bg-uwu-dark-gray rounded-lg shadow-md p-4 relative"
                >
                  <div className="absolute z-10 top-2 right-2">
                    {editMode[selection.id] ? (
                      <div className="flex justify-end space-x-2 ">
                        {/* ✅ Save Button */}
                        <button
                          type="button"
                          onClick={() => handleSave(selection)}
                          className="bg-uwu-red text-white rounded-full w-8 h-8 flex items-center justify-center"
                        >
                          <Save size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2 ">
                        {/* ✅ Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSelection(selection.id)}
                          className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => handleEditClick(selection)}
                          className="bg-uwu-red text-white rounded-full w-8 h-8 flex items-center justify-center"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ✅ Media Container */}
                  <div className="aspect-video relative h-36 w-full px-12">
                    {selectionIsUploading[selection.id] ? (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                        <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
                      </div>
                    ) : editMode[selection.id] ? (
                      selection.isVideo ? (
                        <div className="p-4 rounded-lg -mx-12">
                          <input
                            type="text"
                            value={newVideo[selection.id]?.videoUrl || ''}
                            onChange={(e) =>
                              setNewVideo((prev) => ({
                                ...prev,
                                [selection.id]: {
                                  ...prev[selection.id],
                                  videoUrl: e.target.value,
                                },
                              }))
                            }
                            className="p-2 rounded-md bg-uwu-dark-gray text-white w-full border mb-2 h-8"
                          />
                          <div>
                            <input
                              type="number"
                              value={newVideo[selection.id]?.startTime || 0}
                              onChange={(e) =>
                                setNewVideo((prev) => ({
                                  ...prev,
                                  [selection.id]: {
                                    ...prev[selection.id],
                                    startTime: Number(e.target.value),
                                  },
                                }))
                              }
                              className="p-2 rounded-md bg-uwu-dark-gray text-white w-full border mb-2 h-8 max-w-24"
                            />
                            <label className="ml-2 text-gray-400">
                              Start Time
                            </label>
                          </div>
                          <div>
                            <input
                              type="number"
                              value={newVideo[selection.id]?.endTime || 0}
                              onChange={(e) =>
                                setNewVideo((prev) => ({
                                  ...prev,
                                  [selection.id]: {
                                    ...prev[selection.id],
                                    endTime: Number(e.target.value),
                                  },
                                }))
                              }
                              className="p-2 rounded-md bg-uwu-dark-gray text-white w-full border mb-2 h-8 max-w-24"
                            />
                            <label className="ml-2 text-gray-400">
                              End Time
                            </label>
                          </div>
                        </div>
                      ) : changedSelectionImage[selection.id] &&
                        hasValidImageSource(changedSelectionImage[selection.id]) &&
                        !brokenSelectionImages[selection.id] ? (
                        <Image
                          src={changedSelectionImage[selection.id]}
                          alt="image"
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg px-12"
                          onError={() =>
                            setBrokenSelectionImages((prev) => ({
                              ...prev,
                              [selection.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <>
                          <div className="text-white flex flex-col items-center">
                            <LucidImage size={48} className="mt-6" />
                            <p className="text-sm mt-2">
                              {t('create-worldcup.upload-image')}
                            </p>
                          </div>
                          <input
                            type="file"
                            id="coverImage"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={(e) =>
                              handleEditSelectionImage(e, selection.id)
                            }
                          />
                        </>
                      )
                    ) : selection.isVideo && isYouTubeSelection(selection) ? (
                      <iframe
                        src={`${selection.videoUrl}?autoplay=0&rel=0`}
                        className="rounded-lg w-full h-full"
                        allowFullScreen
                      ></iframe>
                    ) : selection.isVideo &&
                      hasValidImageSource(selection.resourceUrl) ? (
                      <video
                        src={selection.resourceUrl}
                        className="rounded-lg h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        preload="metadata"
                      />
                    ) : hasValidImageSource(selection.resourceUrl) &&
                      !brokenSelectionImages[selection.id] ? (
                      <Image
                        src={selection.resourceUrl}
                        alt="image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg px-12"
                        onError={() =>
                          setBrokenSelectionImages((prev) => ({
                            ...prev,
                            [selection.id]: true,
                          }))
                        }
                      />
                    ) : (
                      renderSelectionImagePlaceholder()
                    )}
                  </div>

                  {/* ✅ Editable Card Content */}
                  <div className="flex flex-col justify-center w-full px-4 mt-3">
                    {/* Name (Editable) */}
                    <div>
                      {editMode[selection.id] ? (
                        <input
                          type="text"
                          value={newName[selection.id]}
                          onChange={(e) =>
                            setNewName((prev) => ({
                              ...prev,
                              [selection.id]: e.target.value,
                            }))
                          }
                          className="p-2 rounded-md bg-uwu-dark-gray text-white w-full border mb-2"
                        />
                      ) : (
                        <h3
                          className="text-white text-base font-bold truncate w-full"
                          title={selection.name}
                        >
                          {selection.name}
                        </h3>
                      )}
                    </div>

                    {/* ✅ Championship Ratio */}
                    <div className="w-full mt-3">
                      <p className="text-xs text-gray-400">
                        {t('create-worldcup.championship-ratio')}
                      </p>
                      <div className="relative w-full h-5 bg-gray-700 rounded-md overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${championshipRatio}%` }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {championshipRatio.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* ✅ Win Ratio */}
                    <div className="w-full mt-2">
                      <p className="text-xs text-gray-400">
                        {t('create-worldcup.win-ratio')}
                      </p>
                      <div className="relative w-full h-5 bg-gray-700 rounded-md overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${winRatio}%` }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                          {winRatio.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-white">
            {t('create-worldcup.no-selections-available')}
          </p>
        )}
      </div>

      {/* pagination */}
      <Pagination
        currentPage={page}
        itemsPerPage={perPage}
        totalItems={selectionsCount}
        pagesToShow={5}
        onPageChange={(newPage) => setPage(newPage)}
      ></Pagination>

      {/* control */}
      <div className="flex justify-between mt-8 mb-16">
        <button
          type="button"
          className="bg-uwu-red py-2 px-4 rounded-lg cursor-pointer text-white"
          onClick={() => onSetMainTab(MainTabsType.COVER)}
        >
          {'<'} {t('create-worldcup.cover')}
        </button>
        <button
          type="button"
          className="bg-uwu-red py-2 px-4 rounded-lg cursor-pointer text-white"
          onClick={() => onSetMainTab(MainTabsType.PUBLISH)}
        >
          {t('create-worldcup.publish')} {'>'}
        </button>
      </div>
    </div>
  );
}
