'use client';

export default function ImageUploadBanner() {
  return (
    <div>
      <div className="w-full bg-red-400 flex justify-center">
        <div className="max-w-6xl w-full py-2 flex items-center text-white justify-center text-center">
          Image upload is temporarily unavailable due to an issue with our
          storage provider (Cloudflare).
        </div>
      </div>
    </div>
  );
}
