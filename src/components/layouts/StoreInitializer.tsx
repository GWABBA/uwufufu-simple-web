'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.reducer';
import { User } from '@/dtos/user.dtos';

export default function StoreInitializer({ user }: { user: User }) {
  const appDispatch = useAppDispatch();

  useEffect(() => {
    if (user) {
      appDispatch(setUser(user)); // ✅ Store user & mark as initialized
    } else {
      appDispatch(setUser(null)); // ✅ If no user, still mark as initialized
    }
  }, [appDispatch, user]);

  return null; // No UI needed
}
