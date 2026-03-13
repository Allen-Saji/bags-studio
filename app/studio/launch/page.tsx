'use client';

import { motion } from 'framer-motion';
import LaunchWizard from '@/components/studio/LaunchWizard';

export default function LaunchPage() {
  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold mb-8"
      >
        Launch a Token
      </motion.h1>
      <LaunchWizard />
    </div>
  );
}
