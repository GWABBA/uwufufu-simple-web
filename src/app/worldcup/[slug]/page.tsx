import { fetchWorldcupBySlug } from '@/services/worldcup.service';
import { notFound } from 'next/navigation';
import WorldcupClient from './WorldcupClient';
import { Metadata } from 'next';

type WorldcupPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata(
  props: WorldcupPageProps
): Promise<Metadata> {
  // Await the params object before destructuring
  const params = await props.params;
  const slug = params.slug;

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

export default async function WorldcupPage(props: WorldcupPageProps) {
  // Await the params object before destructuring
  const params = await props.params;
  const slug = params.slug;

  const worldcup = await fetchWorldcupBySlug(slug);

  if (!worldcup) {
    notFound();
  }

  return <WorldcupClient worldcup={worldcup} />;
}
