'use client';

import Login from '@/components/auth/login/Login';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}
