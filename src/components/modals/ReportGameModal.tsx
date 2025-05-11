'use client';

import { useState, MouseEvent } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface ReportGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const REPORT_REASONS = [
  'inappropriate-content',
  'misleading-or-spam',
  'offensive-language',
  'nsfw-without-tag',
  'copyright-violation',
  'other',
];

export default function ReportGameModal({
  isOpen,
  onClose,
  onSubmit,
}: ReportGameModalProps) {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) {
      toast.error(t('report.select-reason') || 'Please select a reason');
      return;
    }
    onSubmit(selectedReason);
    setSelectedReason('');
    onClose();
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    // Close only if backdrop is clicked (not inner modal)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-uwu-black rounded-lg p-6 w-full max-w-md shadow-lg relative text-white">
        <h2 className="text-xl font-bold mb-4">{t('report.report')}</h2>

        <select
          className="w-full rounded-md p-2 text-sm bg-uwu-gray"
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value)}
        >
          <option value="" disabled>
            {t('report.select-placeholder') || 'Select a reason...'}
          </option>
          {REPORT_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {t(`report.${reason}`) || reason}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            {t('report.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
