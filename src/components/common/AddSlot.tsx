'use client';

import React, { useEffect, useState } from 'react';

type AdSlotProps = {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  reserve?: string | number;

  /**
   * 유저 상태가 확정됐는지.
   * (권장) auth hydrate 완료 후 true.
   * 임시로는 true로 둬도 됨.
   */
  ready?: boolean;

  /** 접는 딜레이(UX용) */
  collapseDelayMs?: number;
};

export default function AdSlot({
  show,
  children,
  className = '',
  reserve = 'min(480px)', // 너 말한 "모바일 2/3" 기준
  ready = true,
  collapseDelayMs = 200,
}: AdSlotProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (show) {
      setCollapsed(false);
      return;
    }

    // 광고 안 보여야 하는데(user premium), 아직 확정 전이면 공간 유지
    if (!ready) {
      setCollapsed(false);
      return;
    }

    // 확정 후 show=false면 공간 접기
    const t = setTimeout(() => setCollapsed(true), collapseDelayMs);
    return () => clearTimeout(t);
  }, [show, ready, collapseDelayMs]);

  const minHeight = show ? reserve : collapsed ? 0 : reserve;

  return (
    <div
      className={className}
      style={{
        minHeight,
        overflow: 'hidden',
        transition: 'min-height 180ms ease',
      }}
    >
      <div style={{ display: show ? 'block' : 'none' }}>{children}</div>
    </div>
  );
}
