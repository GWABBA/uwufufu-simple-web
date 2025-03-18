import { LocaleNames } from '@/constants/locale';
import { Worldcup } from '@/dtos/worldcup.dtos';
import { Visibility } from '@/enums/enums.enum';
import { RootState } from '@/store/store';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface PublishComponentProps {
  game: Worldcup;
  onUpdateGame: (updatedFields: Partial<Worldcup>) => void;
  finalSave: () => void;
}

export default function PublishComponent({
  game,
  onUpdateGame,
  finalSave,
}: PublishComponentProps) {
  const { t } = useTranslation();

  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      onUpdateGame({ [id]: checked });
    } else if (type === 'select-one') {
      // Convert only specific selects to numbers
      const numericFields = ['categoryId']; // ✅ Add IDs of selects that should be numbers
      const newValue = numericFields.includes(id) ? Number(value) : value;

      onUpdateGame({ [id]: newValue });
    } else {
      onUpdateGame({ [id]: value });
    }
  };

  return (
    <div>
      {/* locale */}
      <div className="mb-8">
        <label htmlFor="locale" className="text-white text-lg block">
          {t('create-worldcup.language')}
        </label>
        <select
          id="locale"
          className="p-2 rounded-md w-full bg-uwu-dark-gray text-white"
          value={game?.locale ?? ''}
          onChange={handleInputChange}
        >
          <option value="" disabled>
            {t('create-worldcup.select-language')}
          </option>
          {Object.entries(LocaleNames).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <label htmlFor="visibility" className="text-white block">
          {t('create-worldcup.visibility')}
        </label>
        <select
          id="visibility"
          className="p-2 rounded-md w-full bg-uwu-dark-gray text-white"
          value={game?.visibility || Visibility.IsPublic}
          onChange={handleInputChange}
        >
          <option value={Visibility.IsPublic}>
            {t('create-worldcup.public')}
          </option>
          <option value={Visibility.IsPrivate}>
            {t('create-worldcup.private')}
          </option>
          <option value={Visibility.IsClosed}>
            {t('create-worldcup.closed')}
          </option>
        </select>
      </div>

      {/* Category */}
      <div className="mb-8">
        <label htmlFor="category" className="text-white block">
          {t('create-worldcup.category')}
        </label>
        <select
          id="categoryId"
          className="p-2 rounded-md w-full bg-uwu-dark-gray text-white"
          value={game?.categoryId || ''}
          onChange={handleInputChange}
        >
          <option value="" disabled>
            {t('create-worldcup.select-category')}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* NSFW */}
      <div className="mb-8">
        <div className="flex items-center">
          <label htmlFor="isNsfw" className="text-white mr-2">
            NSFW
          </label>
          <input
            type="checkbox"
            id="isNsfw"
            className="w-5 h-5"
            checked={game?.isNsfw || false}
            onChange={handleInputChange}
          />
        </div>
        <p className="text-uwu-red">{t('create-worldcup.nsfw-warning')}</p>
      </div>

      <div className="flex justify-end">
        <button
          className="bg-uwu-red py-2 px-8 rounded-lg cursor-pointer text-white"
          onClick={finalSave}
        >
          {t('create-worldcup.publish')}
        </button>
      </div>
    </div>
  );
}
