import { fetchWorldcupBySlug } from '@/services/worldcup.service';
import { notFound } from 'next/navigation';
import WorldcupClient from './WorldcupClient';
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

export default async function WorldcupPage({
  params,
  searchParams,
}: {
  params: ParamsPromise;
  searchParams: SearchParamsPromise;
}) {
  // Await the params object before destructuring
  const { slug } = await params;

  // Await the searchParams object before accessing its properties
  const resolvedSearchParams = await searchParams;
  const startedGameId = resolvedSearchParams.startedGameId
    ? Number(resolvedSearchParams.startedGameId)
    : undefined;

  const worldcup = await fetchWorldcupBySlug(slug);

  if (!worldcup) {
    notFound();
  }

  return <WorldcupClient worldcup={worldcup} startedGameId={startedGameId} />;
}
