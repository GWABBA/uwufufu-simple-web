import WorldcupClient from './WorldcupClient';
import { fetchWorldcupBySlug } from '@/services/worldcup.service';

type ParamsPromise = Promise<{ slug: string }>;

export default async function WorldcupPage({
  params,
}: {
  params: ParamsPromise;
}) {
  const { slug } = await params;
  let worldcup;

  try {
    worldcup = await fetchWorldcupBySlug(slug);
  } catch (error) {
    console.error(error);
  }

  if (!worldcup) {
    return (
      <div className="mt-14 flex justify-center :(">Worldcup not found</div>
    );
  }

  return <WorldcupClient worldcup={worldcup} />;
}
