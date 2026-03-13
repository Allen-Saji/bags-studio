'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import AppsMarketplace from '@/components/studio/AppsMarketplace';

export default function AppsPage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = use(params);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AppsMarketplace mint={mint} />
    </motion.div>
  );
}
