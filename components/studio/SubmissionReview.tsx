'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Submission {
  id: string;
  wallet: string;
  proof_url: string | null;
  status: string;
  created_at: string;
}

interface SubmissionReviewProps {
  submissions: Submission[];
  mint: string;
  creatorWallet: string;
  onReviewed?: () => void;
}

export default function SubmissionReview({
  submissions,
  mint,
  creatorWallet,
  onReviewed,
}: SubmissionReviewProps) {
  const [reviewing, setReviewing] = useState<string | null>(null);

  const handleReview = async (submissionId: string, approved: boolean) => {
    setReviewing(submissionId);
    try {
      await fetch(`/api/engage/${mint}/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, creator_wallet: creatorWallet }),
      });
      onReviewed?.();
    } finally {
      setReviewing(null);
    }
  };

  const pending = submissions.filter(s => s.status === 'pending');

  if (pending.length === 0) {
    return (
      <div className="text-xs text-gray-500 py-2">No pending submissions.</div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
        Pending Submissions ({pending.length})
      </h4>
      {pending.map((sub, i) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-border-subtle"
        >
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-gray-300">
              {sub.wallet.slice(0, 6)}...{sub.wallet.slice(-4)}
            </div>
            {sub.proof_url && (
              <a
                href={sub.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-green hover:underline"
              >
                View proof
              </a>
            )}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleReview(sub.id, true)}
              disabled={reviewing === sub.id}
              className="px-2.5 py-1 text-[10px] font-mono rounded bg-green/20 text-green border border-green/30 hover:bg-green/30 transition-colors disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => handleReview(sub.id, false)}
              disabled={reviewing === sub.id}
              className="px-2.5 py-1 text-[10px] font-mono rounded bg-red/20 text-red border border-red/30 hover:bg-red/30 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
