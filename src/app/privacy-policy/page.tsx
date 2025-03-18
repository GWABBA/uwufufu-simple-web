'use client';

import { PRIVACY } from '@/constants/privacyPolicy';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-white text-sm">
      <pre className="whitespace-pre-wrap break-words break-all overflow-hidden">
        {PRIVACY}
      </pre>
    </div>
  );
}
