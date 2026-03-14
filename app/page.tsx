"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

const mono = { fontFamily: "var(--font-mono)" };
const display = { fontFamily: "var(--font-display)" };

const platformStats = [
  { value: "10", label: "Quest Types" },
  { value: "6", label: "Achievement Badges" },
  { value: "5", label: "Tier Levels" },
  { value: "100%", label: "On-chain Verified" },
];

const Icon = ({ d, color = "currentColor" }: { d: string; color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const ICONS = {
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  target: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  award: "M12 15l-2 5 2-1 2 1-2-5zM8.21 13.89L7 23l5-3 5 3-1.21-9.12M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14z",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  trending: "M23 6l-9.5 9.5-5-5L1 18",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
};

const features = [
  {
    iconPath: ICONS.chat,
    tag: "Community Wall",
    title: "A social feed for every token",
    description: "Token-gated community wall where holders post, react, and vibe. Only real holders can speak.",
    color: "#00E676",
  },
  {
    iconPath: ICONS.target,
    tag: "Gamified Quests",
    title: "10 quest types that drive action",
    description: "Hold tokens, refer friends, hit streaks, reach tiers, trade volume, post on X. Every action earns points, verified server-side.",
    color: "#C084FC",
  },
  {
    iconPath: ICONS.award,
    tag: "Achievements",
    title: "Badges that flex on everyone",
    description: "OG Holder, Diamond Hands, Whale, Quest Master, Evangelist, Social Butterfly. Earn badges and show them off on your profile.",
    color: "#FFD700",
  },
  {
    iconPath: ICONS.layers,
    tag: "Conviction Scoring",
    title: "Know who actually matters",
    description: "Balance, consistency, and claim history scored into 5 tiers. Champion, Catalyst, Loyal, Active, OG. No faking it.",
    color: "#60A5FA",
  },
  {
    iconPath: ICONS.trending,
    tag: "Fee Rewards",
    title: "Trade fees flow to top supporters",
    description: "Vault collects trade fees automatically. Weekly distribution sends SOL pro-rata to the engagement leaderboard. Real yield.",
    color: "#00E676",
  },
  {
    iconPath: ICONS.link,
    tag: "Referral Engine",
    title: "Growth that verifies on-chain",
    description: "Every referral link tracks real conversions. Not clicks, not signups. Actual on-chain token holders, verified via Solana RPC.",
    color: "#FF6B6B",
  },
];

const questTypes = [
  { icon: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 6v6l4 2", name: "Token Balance", desc: "Hold X tokens" },
  { icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", name: "Holding Streak", desc: "Hold for X days" },
  { icon: "M18 20V10M12 20V4M6 20v-6", name: "Trade Volume", desc: "Trade X volume" },
  { icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6", name: "Referral Count", desc: "Refer X holders" },
  { icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", name: "Complete Quests", desc: "Meta: do X quests" },
  { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", name: "Tier Reached", desc: "Hit a tier" },
  { icon: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13", name: "Social Share", desc: "Post on X" },
  { icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2", name: "Hold Duration", desc: "Hold X days" },
  { icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01", name: "Claim Count", desc: "Claim X times" },
  { icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z", name: "Custom", desc: "Creator-defined" },
];

const howItWorks = [
  { n: "01", title: "Launch your token on Bags", desc: "Create your token and configure fee-share recipients." },
  { n: "02", title: "Open BagsStudio", desc: "Connect your token to see supporter analytics, tiers, and momentum." },
  { n: "03", title: "Create quests & community", desc: "Set up quests, open the community wall, and let supporters engage." },
  { n: "04", title: "Supporters earn points", desc: "Holding, trading, referring, posting, completing quests. It all counts." },
  { n: "05", title: "Distribute rewards", desc: "Trade fees accumulate in vault. Weekly rewards flow to top supporters." },
];

const comingSoon = [
  { iconPath: "M12 17a2 2 0 0 0 2-2V9a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2zM7 10v4a5 5 0 0 0 10 0v-4M12 17v4M8 21h8", title: "One-Click Staking", desc: "Creator sets up a staking vault in one click. Supporters stake tokens, accumulate points based on amount and duration. Longer you stake, bigger your share of trade fees." },
  { iconPath: "M18 20V10M12 20V4M6 20v-6", title: "Staking Leaderboard", desc: "Real-time leaderboard of top stakers. Stake weight = amount x duration. Compete for the biggest share of the fee pool." },
  { iconPath: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6", title: "Auto-Compounding Rewards", desc: "Staking rewards auto-compound back into your stake position. Set it and forget it. Your share grows automatically." },
];

export default function Home() {
  return (
    <>
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Image src="/logo.png" alt="BagsStudio" width={160} height={40} className="h-10 w-auto" priority />
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden text-sm text-gray-400 transition-colors hover:text-white md:block" style={mono}>Features</a>
            <a href="#quests" className="hidden text-sm text-gray-400 transition-colors hover:text-white md:block" style={mono}>Quests</a>
            <a href="#how-it-works" className="hidden text-sm text-gray-400 transition-colors hover:text-white md:block" style={mono}>How it works</a>
            <a href="/studio" className="group relative overflow-hidden rounded-full bg-green px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-green-dark">
              <span className="relative z-10">Open Studio</span>
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* ─── HERO ─── */}
        <section className="relative min-h-screen overflow-hidden pt-20">
          <div className="grid-pattern absolute inset-0" />
          <div className="pointer-events-none absolute top-1/4 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-green/[0.04] blur-[150px]" />

          <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 lg:flex-row lg:items-center lg:gap-12 lg:pt-28">
            <div className="flex-1 text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-green/20 bg-green/[0.06] px-4 py-2">
                <span className="animate-pulse-dot inline-block h-2 w-2 rounded-full bg-green" />
                <span className="text-xs tracking-[0.2em] text-green uppercase" style={mono}>The Social Layer for Bags Tokens</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="mb-8 text-5xl leading-[1.05] font-extrabold tracking-[-0.03em] md:text-6xl lg:text-7xl" style={display}>
                Where token<br />communities<br /><span className="text-glow text-green">come alive</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                className="mb-10 max-w-lg text-lg leading-relaxed text-gray-300 lg:text-xl">
                Quests. Referrals. Community walls. Achievement badges. Conviction tiers. Fee rewards. Everything your Bags token needs to build a real community, not just a chart.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <a href="/studio" className="glow-green-sm rounded-full bg-green px-8 py-4 text-center text-base font-bold text-black transition-all hover:scale-[1.02]">Open Studio</a>
                <a href="#features" className="rounded-full border border-border-strong px-8 py-4 text-center text-base font-medium text-gray-300 transition-all hover:border-green/30 hover:text-white">See What&apos;s Inside</a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-border-subtle pt-8">
                {platformStats.map(s => (
                  <div key={s.label} className="text-center lg:text-left">
                    <div className="text-2xl font-extrabold text-green" style={mono}>{s.value}</div>
                    <div className="mt-1 text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
              className="relative mt-16 flex-1 lg:mt-0">
              <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green/[0.08] blur-[100px]" />
              <div className="animate-float relative mx-auto w-[320px] md:w-[420px] lg:w-[480px]">
                <Image src="/mascot.png" alt="BagsStudio Mascot" width={480} height={480} className="relative z-10 drop-shadow-[0_0_60px_rgba(0,230,118,0.2)]" priority />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── LIVE PREVIEW STRIP ─── */}
        <section className="relative px-6 py-12">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green/20 to-transparent" />
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="flex flex-wrap items-center justify-center gap-3 text-xs" style={mono}>
              {["Community Wall", "10 Quest Types", "6 Badges", "5 Tiers", "Fee Rewards", "Referrals", "Streaks", "Profiles"].map((item, i) => (
                <motion.span key={item} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="rounded-full border border-green/20 bg-green/[0.06] px-4 py-2 text-green">
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="relative px-6 py-28">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <motion.p {...fadeUp} className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={mono}>Platform Features</motion.p>
              <motion.h2 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="mb-6 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={display}>
                Everything a token<br />community <span className="text-green">needs</span>
              </motion.h2>
              <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-gray-300">
                Not another analytics dashboard. A full social and engagement layer built natively on Bags.
              </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div key={f.tag} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group rounded-2xl border border-border-subtle bg-surface p-6 transition-all hover:border-green/20 hover:bg-surface-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                      <Icon d={f.iconPath} color={f.color} />
                    </div>
                    <span className="rounded-full border border-green/20 bg-green-muted px-3 py-1 text-[10px] tracking-widest text-green uppercase" style={mono}>{f.tag}</span>
                  </div>
                  <h3 className="mb-3 text-lg font-bold tracking-tight" style={display}>{f.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-300">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── QUEST TYPES SHOWCASE ─── */}
        <section id="quests" className="relative px-6 py-28 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green/[0.03] blur-[120px]" />
          <div className="relative z-10 mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <motion.p {...fadeUp} className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={mono}>Gamified Engagement</motion.p>
              <motion.h2 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="mb-6 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={display}>
                10 quest types.<br /><span className="text-green">All server-verified.</span>
              </motion.h2>
              <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="mx-auto max-w-xl text-lg text-gray-300">
                No client-side cheating. Every quest completion is verified on the server using on-chain data, Solana RPC, or manual creator approval.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {questTypes.map((q, i) => (
                <motion.div key={q.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="group rounded-xl border border-border-subtle bg-surface p-4 text-center transition-all hover:border-green/20 hover:bg-surface-2">
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-green/10 border border-green/20">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={q.icon} /></svg>
                  </div>
                  <div className="text-xs font-bold mb-0.5" style={display}>{q.name}</div>
                  <div className="text-[10px] text-gray-500" style={mono}>{q.desc}</div>
                </motion.div>
              ))}
            </div>

            {/* Achievement badges preview */}
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="mt-16 rounded-2xl border border-border-subtle bg-surface p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold" style={display}>Earn Achievement Badges</h3>
                <p className="text-sm text-gray-400 mt-1">Milestones unlock permanent badges on your profile</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", name: "OG Holder", desc: "First 100 supporters" },
                  { icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", name: "Diamond Hands", desc: "30-day streak" },
                  { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", name: "Quest Master", desc: "5+ quests done" },
                  { icon: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z", name: "Evangelist", desc: "10+ referrals" },
                  { icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z", name: "Whale", desc: "Top 1%" },
                  { icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", name: "Social Butterfly", desc: "10+ posts" },
                ].map((b, i) => (
                  <motion.div key={b.name} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.06 }}
                    className="flex items-center gap-2.5 rounded-full border border-green/20 bg-green/[0.06] px-4 py-2 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={b.icon} /></svg>
                    <span className="text-green font-bold" style={mono}>{b.name}</span>
                    <span className="text-[10px] text-gray-500 hidden sm:inline">· {b.desc}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how-it-works" className="relative px-6 py-28">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <motion.p {...fadeUp} className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={mono}>Getting Started</motion.p>
              <motion.h2 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={display}>
                Live in <span className="text-green">5 steps</span>
              </motion.h2>
            </div>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-green/40 via-green/20 to-transparent md:left-10" />
              <div className="flex flex-col gap-4">
                {howItWorks.map((s, i) => (
                  <motion.div key={s.n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="group relative flex gap-6 md:gap-8">
                    <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-green/30 bg-black md:h-20 md:w-20">
                      <span className="text-lg font-bold text-green md:text-xl" style={mono}>{s.n}</span>
                    </div>
                    <div className="flex-1 rounded-xl border border-border-subtle bg-surface p-6 transition-all group-hover:border-green/15 group-hover:bg-surface-2">
                      <h3 className="mb-2 text-lg font-bold tracking-tight md:text-xl" style={display}>{s.title}</h3>
                      <p className="text-sm text-gray-300">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── COMING SOON: STAKING ─── */}
        <section className="relative px-6 py-28 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-green/[0.04] blur-[120px]" />
          <div className="relative z-10 mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <motion.div {...fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-2">
                <span className="text-xs tracking-[0.2em] text-yellow-400 uppercase" style={mono}>Coming Soon</span>
              </motion.div>
              <motion.h2 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="mb-6 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={display}>
                One-click <span className="text-green">staking</span><br />for every Bags token
              </motion.h2>
              <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="mx-auto max-w-2xl text-lg text-gray-300">
                Creators will be able to set up a staking vault in one click. Supporters stake tokens, accumulate weight over time, and earn a proportional share of trade fees. The longer and more you stake, the bigger your cut.
              </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {comingSoon.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl border border-border-subtle bg-surface p-6 relative overflow-hidden">
                  <div className="absolute top-3 right-3 rounded-full bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 text-[9px] text-yellow-400 font-mono">Soon</div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green/10 border border-green/20 mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.iconPath} /></svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={display}>{item.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Staking formula preview */}
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="mt-8 rounded-xl border border-green/20 bg-green-muted p-6 text-center">
              <p className="text-sm text-gray-300 mb-2">Staking reward formula:</p>
              <p className="text-xl font-bold text-green" style={mono}>your_share = (stake_amount x days_staked) / total_weighted_stake x fee_pool</p>
            </motion.div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="relative overflow-hidden px-6 py-28">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          <div className="pointer-events-none absolute inset-0"><div className="absolute bottom-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 translate-y-1/3 rounded-full bg-green/[0.04] blur-[150px]" /><div className="grid-pattern absolute inset-0 opacity-50" /></div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <motion.div {...fadeUp} className="mx-auto mb-10 w-24 md:w-32">
              <Image src="/mascot.png" alt="BagsStudio" width={128} height={128} className="drop-shadow-[0_0_40px_rgba(0,230,118,0.15)]" />
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
              <h2 className="mb-6 text-4xl font-extrabold tracking-[-0.02em] md:text-6xl lg:text-7xl" style={display}>
                Your token deserves<br />a <span className="text-glow text-green">community</span>
              </h2>
              <p className="mx-auto mb-12 max-w-xl text-lg text-gray-300">
                Quests, referrals, badges, rewards, community walls. All natively built for Bags. Stop hoping your holders stay. Give them a reason to.
              </p>
              <a href="/studio" className="glow-green-intense group relative inline-block overflow-hidden rounded-full bg-green px-10 py-4 text-lg font-bold text-black transition-all hover:scale-[1.03]">
                <span className="relative z-10">Enter the Studio</span>
              </a>
              <div className="mt-16 flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-border-subtle" /><span className="text-[10px] tracking-[0.3em] text-gray-400 uppercase" style={mono}>Built on Bags</span><div className="h-px w-12 bg-border-subtle" />
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border-subtle px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="BagsStudio" width={100} height={26} className="h-6 w-auto opacity-50" />
            <span className="text-xs text-gray-400">Bags Hackathon 2026</span>
          </div>
          <div className="flex gap-8">
            {[{ l: "bags.fm", h: "https://bags.fm" }, { l: "Docs", h: "https://docs.bags.fm" }, { l: "Discord", h: "https://discord.gg/bagsapp" }].map(link => (
              <a key={link.l} href={link.h} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 transition-colors hover:text-green" style={mono}>{link.l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
