import { motion } from 'framer-motion';

export default function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center h-40 gap-2">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="w-6 h-10 bg-[#e73929] rounded-md"
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.15,
          }}
        />
      ))}
    </div>
  );
}
