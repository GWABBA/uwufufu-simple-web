'use client';

import { motion } from 'framer-motion';
import LoadingAnimation from '../animation/Loading';

export default function LoadingModal({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingAnimation />
    </motion.div>
  );
}
