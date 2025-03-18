'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Worldcup } from '@/dtos/worldcup.dtos';
import { fetchMyWorldcup, updateWorldcup } from '@/services/worldcup.service';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import CoverComponent from '@/components/create-game/cover-component';
import SelectionsComponent from '@/components/create-game/selections-component';
import PublishComponent from '@/components/create-game/publish-component';
import { MainTabsType } from '@/enums/enums.enum';
import { useTranslation } from 'react-i18next';
import LoadingAnimation from '@/components/animation/Loading';

const CreateGameId = () => {
  const { t } = useTranslation();
  const params = useParams();
  const id = Number(params.id);

  const [mainTab, setMainTab] = useState<MainTabsType>(MainTabsType.COVER);
  const [isLoading, setIsLoading] = useState(true);
  const [game, setGame] = useState<Worldcup | null>(null);
  const [isLoadingGame, setIsLoadingGame] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('accessToken'); // ✅ Read the cookie in client-side

    if (!token) {
      toast.error(t('create-worldcup.edit-worldcup'));
      router.replace('/auth/login?redirect=/create-game');
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    setIsLoadingGame(true);
    const fetchGame = async () => {
      try {
        const worldcup = await fetchMyWorldcup(id);
        setGame({
          ...worldcup,
          categoryId: worldcup!.category ? worldcup?.category.id : 0,
        } as Worldcup);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(t('common.unknown-error-occurred'));
        }
        setIsLoadingGame(false);
      } finally {
        setIsLoadingGame(false);
      }
    };

    fetchGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoadingGame) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-4 md:pt-8">
        <h1 className="text-xl md:text-4xl font-bold text-white mb-8">
          {t('create-worldcup.edit-worldcup')}
        </h1>
        <LoadingAnimation />
      </div>
    );
  }

  const updateGame = (updatedFields: Partial<Worldcup>) => {
    if (!game) return;
    setGame((prev) => ({ ...prev!, ...updatedFields }));
  };

  const onFinalSave = async () => {
    if (!game) return;

    try {
      // ✅ Save the game
      await updateWorldcup(game);
      toast.success(t('create-worldcup.game-saved-successfully'));
      router.push(`/my/games`);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('create-worldcup.failed-to-save-game')
      );
    }
  };

  const renderMainTabContent = () => {
    if (!game) return null;
    switch (mainTab) {
      case MainTabsType.COVER:
        return (
          <CoverComponent
            game={game}
            onUpdateGame={updateGame}
            onSetMainTab={setMainTab}
          />
        );
      case MainTabsType.SELECTIONS:
        return <SelectionsComponent game={game} onSetMainTab={setMainTab} />;
      case MainTabsType.PUBLISH:
        return (
          <PublishComponent
            game={game}
            onUpdateGame={updateGame}
            finalSave={onFinalSave}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto pt-4 md:pt-8 px-2 md:px-0">
      <h1 className="text-xl md:text-4xl font-bold text-white mb-8">
        {t('create-worldcup.edit-worldcup')}
      </h1>
      {/* tabs */}
      <div className="mb-4">
        <span
          className={`cursor-pointer text-base md:text-lg ${
            mainTab === MainTabsType.COVER ? 'text-uwu-red' : 'text-white'
          }`}
          onClick={() => setMainTab(MainTabsType.COVER)}
        >
          {t('create-worldcup.cover')}
        </span>
        <span className="text-white text-lg mx-4">|</span>
        <span
          className={`cursor-pointer text-base md:text-lg ${
            mainTab === MainTabsType.SELECTIONS ? 'text-uwu-red' : 'text-white'
          }`}
          onClick={() => setMainTab(MainTabsType.SELECTIONS)}
        >
          {t('create-worldcup.choices')}
        </span>
        <span className="text-white text-lg mx-4">|</span>
        <span
          className={`cursor-pointer text-base md:text-lg ${
            mainTab === MainTabsType.PUBLISH ? 'text-uwu-red' : 'text-white'
          }`}
          onClick={() => setMainTab(MainTabsType.PUBLISH)}
        >
          {t('create-worldcup.publish')}
        </span>
      </div>

      {renderMainTabContent()}
    </div>
  );
};

export default CreateGameId;
