'use client';

import { TERMSEN } from '@/constants/termsOfService';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-white text-sm">
      <pre className="whitespace-pre-wrap break-words break-all overflow-hidden">
        {TERMSEN}
      </pre>
    </div>
  );
}
