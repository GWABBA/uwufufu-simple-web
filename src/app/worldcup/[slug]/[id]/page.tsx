import { fetchStartedGameBySlugAndId } from '@/services/startedGames.service';
import { Metadata } from 'next';
import WorldcupResultClient from './WorldcupResultClient';

type ParamsPromise = Promise<{ slug: string; id: string }>;

export async function generateMetadata({
  params,
}: {
  params: ParamsPromise;
}): Promise<Metadata> {
  const { slug, id: resultId } = await params;
  const numericId = Number(resultId);

  if (isNaN(numericId) || numericId <= 0) {
    return {
      title: 'Invalid Result | Uwufufu',
      description: 'The requested result is invalid or does not exist.',
    };
  }

  const startedGame = await fetchStartedGameBySlugAndId(slug, numericId);

  if (!startedGame) {
    return {
      title: 'Result Not Found | Uwufufu',
      description: 'The requested game result could not be found.',
    };
  }

  return {
    title: `${startedGame.game.title} - Final Result | Uwufufu`,
    description: `See the final winner of ${startedGame.game.title}! ${startedGame.game.description}`,
    openGraph: {
      title: `${startedGame.game.title} - Final Winner`,
      description: `Final winner for ${startedGame.game.title}. ${startedGame.game.description}`,
      url: `https://uwufufu.com/worldcup/${slug}/${resultId}`,
      images: [
        {
          url: startedGame.resultImage,
          width: 1200,
          height: 630,
          alt: `Final winner for ${startedGame.game.title}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${startedGame.game.title} - Final Winner`,
      description: `See the final winner of ${startedGame.game.title}.`,
      images: [startedGame.resultImage],
    },
  };
}

export default async function WorldcupPage({
  params,
}: {
  params: ParamsPromise;
}) {
  const { slug, id: resultId } = await params;
  const numericId = Number(resultId);

  if (isNaN(numericId) || numericId <= 0) {
    return <div>Invalid ID</div>;
  }

  const startedGame = await fetchStartedGameBySlugAndId(slug, numericId);
  if (!startedGame) {
    return <div>Result not found</div>;
  }

  return <WorldcupResultClient startedGame={startedGame} />;
}
