'use client';

import { useEffect } from 'react';

export default function HardRedirect({ url }: { url: string }) {
  useEffect(() => {
    // 브라우저 환경에서 즉시 새로고침 이동
    window.location.href = url;
  }, [url]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-uwu-black">
      {/* 리다이렉트 되는 동안 보여줄 로딩 화면 */}
      <div className="animate-pulse text-white">
        Redirecting to NSFW content...
      </div>
    </div>
  );
}
