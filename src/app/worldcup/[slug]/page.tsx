import { fetchWorldcupBySlug } from '@/services/worldcup.service';
import { notFound, redirect } from 'next/navigation';
import WorldcupClient from './WorldcupClient';
import { Metadata } from 'next';
import HardRedirect from '@/components/common/HardRedirect';
import { isVideoUrl } from '@/utils/media';

type ParamsPromise = Promise<{ slug: string }>;
type SearchParamsPromise = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export async function generateMetadata({
  params,
}: {
  params: ParamsPromise;
}): Promise<Metadata> {
  // Await the params object before destructuring
  const { slug } = await params;

  const worldcup = await fetchWorldcupBySlug(slug);

  if (!worldcup) {
    return {
      title: 'Worldcup Not Found | UwUFUFU',
      description: 'The requested worldcup could not be found.',
    };
  }

  const title = `${worldcup.title} | UwUFUFU`;
  const description =
    worldcup.description ?? 'Play and share your favorite worldcup brackets!';
  const image =
    worldcup.coverImage && !isVideoUrl(worldcup.coverImage)
      ? worldcup.coverImage
      : '/assets/common/default-thumbnail.webp';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: image }],
    },
  };
}

export default async function WorldcupPage({
  params,
  searchParams,
}: {
  params: ParamsPromise;
  searchParams: SearchParamsPromise;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const worldcup = await fetchWorldcupBySlug(slug);

  if (!worldcup) notFound();

  // NSFW 게임이면 NSFW 전용 경로로 리다이렉트
  if (worldcup.isNsfw) {
    const queryString = resolvedSearchParams.startedGameId
      ? `?startedGameId=${resolvedSearchParams.startedGameId}`
      : '';

    const targetUrl = `/nsfw/worldcup/${slug}${queryString}`;

    // 이 컴포넌트가 브라우저에 전달되는 순간 useEffect 내의 window.location.href가 실행됩니다.
    return <HardRedirect url={targetUrl} />;
  }

  const startedGameId = resolvedSearchParams.startedGameId
    ? Number(resolvedSearchParams.startedGameId)
    : undefined;

  return <WorldcupClient worldcup={worldcup} startedGameId={startedGameId} />;
}
