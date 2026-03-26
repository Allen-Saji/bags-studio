'use client';

import { use } from 'react';
import Link from 'next/link';
import QuestBuilder from '@/components/studio/QuestBuilder';
import { useTokenRole } from '@/lib/use-token-role';

export default function NewQuestPage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = use(params);
  const { isCreator, wallet, role } = useTokenRole(mint);

  if (role === 'loading') {
    return (
      <div className="flex items-center justify-center pt-24">
        <div className="w-6 h-6 border-2 border-green/30 border-t-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="max-w-md mx-auto pt-12 text-center">
        <div className="text-red text-lg mb-2">Access Denied</div>
        <p className="text-gray-500 text-sm mb-6">
          Only the token creator can create quests. Sign in with the creator&apos;s X or GitHub account.
        </p>
        <Link href={`/studio/${mint}/quests`} className="text-green hover:underline text-sm">
          ← Back to quests
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <QuestBuilder mint={mint} creatorWallet={wallet || ''} />
    </div>
  );
}
