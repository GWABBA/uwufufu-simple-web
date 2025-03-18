export const fetchResultBySlug = async (slug: string) => {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/results/${slug}`
  );
  return result.json();
};
