import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center text-white">
      <h1 className="text-2xl md:text-3xl font-semibold">Game Not Found</h1>
      <p className="mt-3 text-gray-300">
        The worldcup you’re looking for doesn’t exist or was removed.
      </p>
      <Link
        href="/"
        className="inline-block mt-6 rounded-lg bg-uwu-red px-4 py-2 text-white hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
