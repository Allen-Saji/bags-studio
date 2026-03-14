const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // --- Landing ---
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'public/screenshots/landing.png' });

  // --- Studio Home ---
  await page.goto('http://localhost:3000/studio');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'public/screenshots/studio.png' });

  // --- Dashboard ---
  await page.goto('http://localhost:3000/studio/EodnHSfa9PF94xfVYfumPV19iuT8C4CyUrzy5LtuBAGS');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'public/screenshots/dashboard.png' });

  // --- Community Wall (inject dummy posts) ---
  await page.goto('http://localhost:3000/studio/EodnHSfa9PF94xfVYfumPV19iuT8C4CyUrzy5LtuBAGS/community');
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const container = document.querySelector('main');
    if (!container) return;
    // Replace empty state with dummy posts
    const emptyState = container.querySelector('.text-center.py-12');
    const postList = emptyState?.parentElement;
    if (!postList) return;

    const posts = [
      { wallet: '7kYp...3xFm', time: '2m', tier: 'Champion', tierColor: '#FFD700', content: 'Just hit Diamond Hands on $SECURECLAW. 30 days and counting. Who else is still holding?', reactions: [{e:'🔥',c:47},{e:'💎',c:32},{e:'👑',c:18}] },
      { wallet: 'Bk7L...4eHn', time: '8m', tier: 'Catalyst', tierColor: '#C084FC', content: 'me watching my $ROWBOAT bags after completing every quest on BagsStudio', hasImage: true, reactions: [{e:'🔥',c:124},{e:'🚀',c:89},{e:'💰',c:43}] },
      { wallet: 'Qp3W...rY8s', time: '15m', tier: 'Loyal', tierColor: '#00E676', content: 'Just referred my 10th friend to $COMPOSIO and unlocked the Evangelist badge. The referral quest system is actually genius', reactions: [{e:'👑',c:56},{e:'🔥',c:34}] },
      { wallet: 'Fm2Y...kR4p', time: '22m', tier: 'Champion', tierColor: '#FFD700', content: 'Weekly rewards just dropped. Claimed 0.8 SOL from the vault. Holding + doing quests actually pays. LFG', reactions: [{e:'💰',c:78},{e:'🚀',c:52},{e:'🔥',c:31}] },
      { wallet: 'Dn9X...fK2m', time: '35m', tier: 'Active', tierColor: '#60A5FA', content: 'New quest dropped: "Stack 50k tokens" for 150 points. Already halfway there', reactions: [{e:'🔥',c:23},{e:'💎',c:15}] },
    ];

    const postsHTML = posts.map(p => `
      <div style="border:1px solid #1A1A1A; border-radius:12px; padding:16px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <div style="width:28px;height:28px;border-radius:50%;background:#0C0C0C;border:1px solid #1A1A1A;display:flex;align-items:center;justify-content:center;font-size:10px;font-family:monospace;color:#808080;">${p.wallet.slice(0,2)}</div>
          <span style="font-size:12px;font-family:monospace;color:#E0E0E0;">${p.wallet}</span>
          <span style="font-size:9px;padding:2px 8px;border-radius:99px;font-family:monospace;background:${p.tierColor}15;color:${p.tierColor};border:1px solid ${p.tierColor}30;">${p.tier}</span>
          <span style="font-size:10px;color:#555;">${p.time}</span>
        </div>
        <p style="font-size:14px;color:#E0E0E0;line-height:1.5;margin-bottom:12px;">${p.content}</p>
        ${p.hasImage ? '<div style="border-radius:8px;overflow:hidden;border:1px solid #1A1A1A;margin-bottom:12px;height:160px;background:#0C0C0C;display:flex;align-items:center;justify-content:center;"><img src="https://media1.tenor.com/m/Wn3RXAE1fOMAAAAd/pedro-pedro-pedro-raccoon.gif" style="height:100%;object-fit:cover;" onerror="this.parentElement.style.display=\'none\'"/></div>' : ''}
        <div style="display:flex;gap:6px;">
          ${p.reactions.map(r => `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:12px;background:rgba(0,230,118,0.1);border:1px solid rgba(0,230,118,0.2);color:#fff;">${r.e} <span style="font-size:10px;font-family:monospace;">${r.c}</span></span>`).join('')}
        </div>
      </div>
    `).join('');

    // Replace the composer + empty state
    const composerBox = container.querySelector('.rounded-xl.border');
    if (composerBox) {
      composerBox.innerHTML = `
        <textarea placeholder="What's happening with this token?" rows="2" style="width:100%;background:transparent;color:#fff;font-size:14px;border:none;outline:none;resize:none;font-family:inherit;"></textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
          <span style="font-size:10px;font-family:monospace;color:#555;">0/280</span>
          <button style="padding:6px 16px;border-radius:99px;background:#00E676;color:#000;font-size:12px;font-weight:600;border:none;">Post</button>
        </div>
      `;
    }

    if (emptyState) {
      emptyState.outerHTML = `<div>${postsHTML}</div>`;
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/screenshots/community.png' });

  // --- Quests (inject dummy quests) ---
  await page.goto('http://localhost:3000/studio/EodnHSfa9PF94xfVYfumPV19iuT8C4CyUrzy5LtuBAGS/quests');
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const emptyBox = main.querySelector('.rounded-xl.border.p-8');
    if (!emptyBox) return;

    const quests = [
      { title: 'Diamond Hands Challenge', desc: 'Hold tokens for 30 consecutive days to prove your conviction.', type: 'Holding Streak', points: 200, expires: '2026-04-15' },
      { title: 'Stack 50k Tokens', desc: 'Accumulate a balance of at least 50,000 tokens.', type: 'Token Balance', points: 150 },
      { title: 'Refer 3 Friends', desc: 'Get 3 friends to buy and hold the token through your referral link.', type: 'Referral Count', points: 100 },
      { title: 'First Trade on Bags', desc: 'Execute your first swap through the BagsStudio trading interface.', type: 'Trade Volume', points: 25 },
      { title: 'Post Your Stack on X', desc: 'Share a screenshot of your holdings on X/Twitter and submit the link.', type: 'Social Share', points: 75, approval: true },
      { title: 'Reach Loyal Tier', desc: 'Climb the conviction leaderboard to reach the Loyal tier (top 15%).', type: 'Tier Reached', points: 100 },
      { title: 'Complete 5 Quests', desc: 'Finish any 5 quests to unlock the Quest Master achievement badge.', type: 'Complete Quests', points: 300 },
    ];

    const questsHTML = quests.map((q, i) => `
      <div style="display:block;border:1px solid #1A1A1A;border-radius:12px;padding:16px;margin-bottom:12px;transition:all 0.2s;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="flex:1;">
            <h4 style="font-size:14px;font-weight:600;color:#fff;margin:0 0 4px 0;">${q.title}</h4>
            <p style="font-size:12px;color:#808080;margin:0 0 8px 0;">${q.desc}</p>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:10px;font-family:monospace;padding:2px 8px;border-radius:99px;background:#0C0C0C;border:1px solid #1A1A1A;color:#808080;">${q.type}</span>
              ${q.approval ? '<span style="font-size:10px;padding:2px 8px;border-radius:99px;background:rgba(255,193,7,0.1);border:1px solid rgba(255,193,7,0.2);color:#FFC107;font-family:monospace;">Requires Approval</span>' : ''}
              ${q.expires ? `<span style="font-size:10px;color:#555;">Expires ${q.expires}</span>` : ''}
            </div>
          </div>
          <div style="text-align:right;margin-left:16px;">
            <div style="font-size:14px;font-family:monospace;font-weight:700;color:#00E676;">+${q.points}</div>
            <div style="font-size:9px;color:#808080;">pts</div>
          </div>
        </div>
      </div>
    `).join('');

    emptyBox.outerHTML = `<div>${questsHTML}</div>`;

    // Also add "Create Quest" button
    const header = main.querySelector('.flex.items-center.justify-between');
    if (header && !header.querySelector('a')) {
      header.innerHTML += `<a style="padding:8px 16px;border-radius:8px;background:#00E676;color:#000;font-size:13px;font-weight:600;text-decoration:none;">Create Quest</a>`;
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/screenshots/quests.png' });

  // --- Rewards (inject dummy vault + epochs) ---
  await page.goto('http://localhost:3000/studio/EodnHSfa9PF94xfVYfumPV19iuT8C4CyUrzy5LtuBAGS/rewards');
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = `
      <div style="max-width:768px;">
        <h1 style="font-size:24px;font-weight:700;font-family:var(--font-syne),sans-serif;margin-bottom:8px;">Rewards</h1>
        <p style="font-size:14px;color:#808080;margin-bottom:24px;">Distribute trade fees to your top supporters based on engagement points.</p>

        <!-- Setup Guide -->
        <div style="border:1px solid #1A1A1A;border-radius:12px;padding:20px;margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:700;margin:0 0 4px;">How Rewards Work</h3>
          <p style="font-size:12px;color:#808080;margin:0 0 16px;">Follow these steps to start distributing trade fee rewards to your top supporters.</p>
          ${[
            { n: 1, title: 'Create Reward Vault', done: true },
            { n: 2, title: 'Configure Fee Share on Bags', done: true },
            { n: 3, title: 'Fees Accumulate', done: true },
            { n: 4, title: 'Weekly Distribution', current: true },
            { n: 5, title: 'Supporters Claim', done: false },
          ].map(s => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:8px;margin-bottom:8px;border:1px solid ${s.current ? 'rgba(0,230,118,0.2)' : '#1A1A1A'};background:${s.current ? 'rgba(0,230,118,0.03)' : '#060606'};opacity:${s.done || s.current ? 1 : 0.4};">
              <div style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-family:monospace;font-weight:700;${s.done ? 'background:#00E676;color:#000;' : s.current ? 'background:rgba(0,230,118,0.2);color:#00E676;border:1px solid rgba(0,230,118,0.3);' : 'background:#0C0C0C;color:#555;border:1px solid #1A1A1A;'}">${s.done ? '✓' : s.n}</div>
              <span style="font-size:13px;color:${s.current ? '#fff' : s.done ? '#808080' : '#555'};">${s.title}</span>
            </div>
          `).join('')}
        </div>

        <!-- Vault Stats -->
        <div style="border:1px solid #1A1A1A;border-radius:12px;padding:20px;margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:700;margin:0 0 16px;">Reward Vault</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            <div style="padding:12px;border-radius:8px;background:#0C0C0C;">
              <div style="font-size:10px;color:#808080;text-transform:uppercase;">Total Distributed</div>
              <div style="font-size:14px;font-family:monospace;font-weight:700;color:#fff;">12.4500 SOL</div>
            </div>
            <div style="padding:12px;border-radius:8px;background:#0C0C0C;">
              <div style="font-size:10px;color:#808080;text-transform:uppercase;">Total Claimed</div>
              <div style="font-size:14px;font-family:monospace;font-weight:700;color:#00E676;">8.2300 SOL</div>
            </div>
          </div>
        </div>

        <!-- Epoch History -->
        <div style="margin-bottom:24px;">
          <h4 style="font-size:11px;color:#808080;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;">Distribution History</h4>
          ${[
            { n: 4, date: '2026-03-14', wallets: 47, balance: '3.2100', claimed: '2.8400' },
            { n: 3, date: '2026-03-07', wallets: 42, balance: '4.1200', claimed: '3.9100' },
            { n: 2, date: '2026-02-28', wallets: 38, balance: '2.8700', claimed: '1.4800' },
            { n: 1, date: '2026-02-21', wallets: 31, balance: '2.2500', claimed: '0.0000' },
          ].map(e => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-radius:8px;background:#0C0C0C;border:1px solid #1A1A1A;margin-bottom:8px;">
              <div>
                <span style="font-size:12px;font-family:monospace;color:#E0E0E0;">Epoch #${e.n}</span>
                <div style="font-size:10px;color:#555;margin-top:2px;">${e.date} · ${e.wallets} wallets</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:14px;font-family:monospace;font-weight:700;color:#fff;">${e.balance} SOL</div>
                <div style="font-size:10px;color:#808080;">${e.claimed} claimed</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Claimable -->
        <div style="border:1px solid #1A1A1A;border-radius:12px;padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="font-size:14px;font-weight:700;margin:0;">Engagement Rewards</h3>
            <span style="font-size:14px;font-family:monospace;font-weight:700;color:#00E676;">0.4200 SOL</span>
          </div>
          ${[
            { amount: '0.240000', pts: 482 },
            { amount: '0.180000', pts: 361 },
          ].map(c => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-radius:8px;background:#0C0C0C;border:1px solid #1A1A1A;margin-bottom:8px;">
              <div>
                <div style="font-size:12px;font-family:monospace;color:#E0E0E0;">${c.amount} SOL</div>
                <div style="font-size:10px;color:#555;">${c.pts} pts</div>
              </div>
              <button style="padding:6px 12px;font-size:11px;font-family:monospace;border-radius:8px;background:rgba(0,230,118,0.2);color:#00E676;border:1px solid rgba(0,230,118,0.3);cursor:pointer;">Claim</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/screenshots/rewards.png' });

  await browser.close();
  console.log('All screenshots taken');
})();
