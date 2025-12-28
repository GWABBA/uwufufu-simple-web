import { fetchWorldcupBySlug } from '@/services/worldcup.service';
import { notFound, redirect } from 'next/navigation';
import WorldcupClient from '../../../worldcup/[slug]/WorldcupClient'; // 기존 클라이언트 컴포넌트 재사용
import { Metadata } from 'next';

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
  const image = worldcup.coverImage || '/assets/common/default-thumbnail.webp';

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

export default async function NsfwWorldcupPage({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const worldcup = await fetchWorldcupBySlug(slug);

  if (!worldcup) notFound();

  // ✅ 핵심 로직: NSFW가 아니면 일반 경로로 리다이렉트
  if (!worldcup.isNsfw) {
    const queryString = resolvedSearchParams.startedGameId
      ? `?startedGameId=${resolvedSearchParams.startedGameId}`
      : '';
    redirect(`/worldcup/${slug}${queryString}`);
  }

  const startedGameId = resolvedSearchParams.startedGameId
    ? Number(resolvedSearchParams.startedGameId)
    : undefined;

  return <WorldcupClient worldcup={worldcup} startedGameId={startedGameId} />;
}
