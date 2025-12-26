'use client';

import React from 'react';

type BannerSlotProps = {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  reserve?: string | number; // ex) "84px" or "clamp(72px, 10vh, 96px)"
};

export default function BannerSlot({
  show,
  children,
  className = '',
  reserve = 'clamp(72px, 10vh, 96px)',
}: BannerSlotProps) {
  return (
    <div className={className} style={{ minHeight: reserve }}>
      <div style={{ display: show ? 'block' : 'none' }}>{children}</div>
    </div>
  );
}
