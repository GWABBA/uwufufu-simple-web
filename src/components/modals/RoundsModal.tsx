'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface RoundsModalProps {
  isOpen: boolean;
  selectionsCount: number;
  onClose: () => void;
  onConfirm: () => void;
  onRoundsSelect: (rounds: number) => void;
}

const RoundsModal: React.FC<RoundsModalProps> = ({
  isOpen,
  selectionsCount,
  onClose,
  onConfirm,
  onRoundsSelect,
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  // Generate round options (powers of 2) + next power of 2 (for bye support)
  const roundOptions: number[] = [];
  let round = 2;
  while (round <= selectionsCount) {
    roundOptions.push(round);
    round *= 2;
  }

  // If selectionsCount is not a power of 2, add the next power as a final option
  if (roundOptions[roundOptions.length - 1] < selectionsCount) {
    const nextPower = Math.pow(2, Math.ceil(Math.log2(selectionsCount)));
    if (!roundOptions.includes(nextPower)) {
      roundOptions.push(nextPower);
    }
  }

  // Default to the highest round
  const [selectedRound, setSelectedRound] = useState<number>(
    roundOptions.length >= 2
      ? roundOptions[roundOptions.length - 2]
      : roundOptions[roundOptions.length - 1] || 2
  );

  // Update default value if selectionsCount changes
  useEffect(() => {
    if (roundOptions.length > 0) {
      const newDefault =
        roundOptions.length >= 2
          ? roundOptions[roundOptions.length - 2]
          : roundOptions[roundOptions.length - 1];
      setSelectedRound(newDefault);
      onRoundsSelect(newDefault); // Update the parameter too
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionsCount]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="w-full max-w-[480px] max-h-[600px] bg-uwu-black text-white p-4 relative rounded-md">
        <h2 className="text-lg font-bold mb-4">
          {t('worldcup.no-of-choices')}
        </h2>
        <select
          value={selectedRound}
          onChange={(e) => {
            const value = Number(e.target.value);
            setSelectedRound(value);
            onRoundsSelect(value);
          }}
          className="w-full p-2 rounded mb-4 bg-uwu-gray"
        >
          {roundOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <div className="flex justify-end">
          <button
            onClick={() => onConfirm()}
            className="bg-uwu-red text-white px-4 py-2 rounded-md min-w-24"
          >
            {t('worldcup.start')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundsModal;
