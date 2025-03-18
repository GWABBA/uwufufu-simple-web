'use client';

import { StartedGameResultDto } from '@/dtos/startedGames.dtos';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface WorldcupClientProps {
  startedGame: StartedGameResultDto | null;
}

export default function WorldcupResultClient({
  startedGame,
}: WorldcupClientProps) {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      if (startedGame) {
        router.replace(`/worldcup/${startedGame.game.slug}`);
      } else {
        router.replace('/');
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>Being redirected to the game...</div>;
}
