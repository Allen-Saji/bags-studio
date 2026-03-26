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
  { value: "6", label: "Badges" },
  { value: "5", label: "Conviction Tiers" },
  { value: "12", label: "On-chain Instructions" },
];

const Icon = ({ d, color = "currentColor", size = 20 }: { d: string; color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const ICONS = {
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  target: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  award: "M12 15l-2 5 2-1 2 1-2-5zM8.21 13.89L7 23l5-3 5 3-1.21-9.12M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14z",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  vault: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  stake: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  coins: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  trendUp: "M23 6l-9.5 9.5-5-5L1 18",
  gitBranch: "M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  vote: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
};

const features = [
  {
    iconPath: ICONS.chat, tag: "Community Wall",
    title: "Token-gated social feed",
    description: "Only real holders can post. Every interaction earns engagement points. Reactions, threads, and tier badges visible on every message.",
    color: "#00E676",
  },
  {
    iconPath: ICONS.target, tag: "Gamified Quests",
    title: "10 quest types, all on-chain verified",
    description: "Hold challenges, referral missions, trading goals, streak targets. Server-side verification using Solana RPC. No client-side cheating.",
    color: "#C084FC",
  },
  {
    iconPath: ICONS.vault, tag: "On-Chain Reward Vault",
    title: "Trustless SOL distribution",
    description: "PDA vault collects trade fees. Merkle tree distribution sends real SOL to top supporters weekly. Fully on-chain, no trust required.",
    color: "#FFD700",
  },
  {
    iconPath: ICONS.stake, tag: "Community Staking",
    title: "Stake tokens, earn points",
    description: "Holders stake into a program-owned vault. Points accumulate based on amount and time. Unstaking forfeits current epoch points. Diamond hands rewarded.",
    color: "#60A5FA",
  },
  {
    iconPath: ICONS.lock, tag: "Creator Token Lock",
    title: "Publicly verifiable commitment",
    description: "Creators lock tokens on-chain for a set duration. No early unlock. Multiple locks, extendable. Visible on the community page — trust, verified.",
    color: "#FF6B6B",
  },
  {
    iconPath: ICONS.layers, tag: "Conviction Scoring",
    title: "Rank every holder by commitment",
    description: "Balance, consistency, staking, and claim history scored into 5 tiers: Champion, Catalyst, Loyal, Active, OG. Your score determines your reward share.",
    color: "#00E676",
  },
  {
    iconPath: ICONS.award, tag: "Achievement Badges",
    title: "6 badges that flex your status",
    description: "OG Holder, Diamond Hands, Whale, Quest Master, Evangelist, Social Butterfly. Earned through real on-chain activity, displayed on your profile.",
    color: "#C084FC",
  },
  {
    iconPath: ICONS.link, tag: "Referral Engine",
    title: "Growth verified on-chain",
    description: "Unique referral links track real conversions. Not clicks — actual token holders verified via Solana RPC. Referrer and referred both earn points.",
    color: "#FFD700",
  },
];

const howItWorks = [
  { n: "01", title: "Sign in with X or GitHub", desc: "No wallet export needed. We verify your identity against the Bags platform to confirm token ownership." },
  { n: "02", title: "Connect your token", desc: "Paste your mint address. Dashboard, leaderboard, and community tools are live instantly." },
  { n: "03", title: "Create quests & community", desc: "Set up quests, open the community wall, and configure staking. Holders start engaging immediately." },
  { n: "04", title: "Set up on-chain reward vault", desc: "One click creates a trustless PDA vault. Add it as a fee-share recipient on bags.fm. Trade fees flow in." },
  { n: "05", title: "Holders stake & earn", desc: "Holders stake tokens, complete quests, refer friends, and climb the leaderboard. Points accumulate daily." },
  { n: "06", title: "Weekly SOL rewards", desc: "Hit distribute. Merkle root goes on-chain. Top supporters claim real SOL proportional to their engagement." },
];

const tokenUtility = [
  { iconPath: ICONS.zap, title: "Points Multiplier", desc: "Hold $STUDIO for boosted engagement points across all communities you participate in." },
  { iconPath: ICONS.star, title: "Creator Pro Tools", desc: "Analytics dashboard, announcement blasts, airdrop tool. Premium features require holding $STUDIO." },
  { iconPath: ICONS.trendUp, title: "Featured Placement", desc: "Creators stake $STUDIO to get their token featured on the studio home page." },
  { iconPath: ICONS.coins, title: "Platform Revenue Share", desc: "$STUDIO stakers earn a share of all platform fees — swap fees, vault fees, and subscription revenue." },
  { iconPath: ICONS.vote, title: "Governance", desc: "Vote on platform direction, featured tokens, and new feature priorities. Your stake = your voice." },
];

const revenueStreams = [
  { label: "Swap Fee", value: "0.25%", desc: "On every trade through BagsStudio" },
  { label: "Vault Distribution Fee", value: "2%", desc: "On weekly SOL reward distributions" },
  { label: "Creator Subscriptions", value: "$STUDIO", desc: "Paid in $STUDIO, burned for deflation" },
  { label: "Featured Listings", value: "$STUDIO", desc: "Stake to promote tokens on studio home" },
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
            <a href="#how-it-works" className="hidden text-sm text-gray-400 transition-colors hover:text-white md:block" style={mono}>How it works</a>
            <a href="#token" className="hidden text-sm text-gray-400 transition-colors hover:text-white md:block" style={mono}>$STUDIO</a>
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
                <span className="text-xs tracking-[0.2em] text-green uppercase" style={mono}>The Community Layer for Bags Tokens</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="mb-8 text-5xl leading-[1.05] font-extrabold tracking-[-0.03em] md:text-6xl lg:text-7xl" style={display}>
                Where token<br />communities<br /><span className="text-glow text-green">come alive</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                className="mb-10 max-w-lg text-lg leading-relaxed text-gray-300 lg:text-xl">
                Quests. Staking. On-chain reward vaults. Creator token locks. Community walls. Everything your Bags token needs to build and reward a real community.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <a href="/studio" className="glow-green-sm rounded-full bg-green px-8 py-4 text-center text-base font-bold text-black transition-all hover:scale-[1.02]">Open Studio</a>
                <a href="#features" className="rounded-full border border-border-strong px-8 py-4 text-center text-base font-medium text-gray-300 transition-all hover:border-green/30 hover:text-white">See What&apos;s Inside</a>
              </motion.div>

              {/* stats removed — covered in features section */}
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

        {/* strip removed — repetitive with features */}

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
                Not another analytics dashboard. A full social, staking, and rewards layer — with on-chain smart contracts backing every feature.
              </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <motion.div key={f.tag} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="group rounded-2xl border border-border-subtle bg-surface p-6 transition-all hover:border-green/20 hover:bg-surface-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                      <Icon d={f.iconPath} color={f.color} />
                    </div>
                  </div>
                  <span className="rounded-full border border-green/20 bg-green-muted px-3 py-1 text-[10px] tracking-widest text-green uppercase" style={mono}>{f.tag}</span>
                  <h3 className="mt-3 mb-2 text-base font-bold tracking-tight" style={display}>{f.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-300">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how-it-works" className="relative px-6 py-28">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <motion.p {...fadeUp} className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={mono}>Getting Started</motion.p>
              <motion.h2 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={display}>
                Live in <span className="text-green">6 steps</span>
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

        {/* ─── $STUDIO TOKEN ─── */}
        <section id="token" className="relative px-6 py-28 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green/[0.03] blur-[120px]" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <motion.div {...fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-green/20 bg-green/[0.06] px-4 py-2">
                <span className="text-xs tracking-[0.2em] text-green uppercase font-bold" style={mono}>$STUDIO</span>
              </motion.div>
              <motion.h2 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="mb-6 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={display}>
                The platform<br /><span className="text-green">loyalty token</span>
              </motion.h2>
              <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="mx-auto max-w-2xl text-lg text-gray-300">
                $STUDIO powers the BagsStudio ecosystem. Hold it for boosted rewards, premium tools, and platform revenue share. It doesn&apos;t gate community participation — quests, referrals, and rewards stay open for everyone.
              </motion.p>
            </div>

            {/* Token utility grid */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-16">
              {tokenUtility.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="rounded-2xl border border-border-subtle bg-surface p-5 transition-all hover:border-green/20 hover:bg-surface-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 border border-green/20 mb-3">
                    <Icon d={item.iconPath} color="#00E676" />
                  </div>
                  <h3 className="text-sm font-bold mb-1" style={display}>{item.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Revenue model */}
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-2xl border border-border-subtle bg-surface p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2" style={display}>Platform Revenue</h3>
                <p className="text-sm text-gray-400">Sustainable revenue that flows back to $STUDIO stakers</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {revenueStreams.map((r, i) => (
                  <motion.div key={r.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.06 }}
                    className="rounded-xl border border-green/15 bg-green/[0.04] p-5 text-center">
                    <div className="text-2xl font-extrabold text-green mb-1" style={mono}>{r.value}</div>
                    <div className="text-sm font-bold mb-1" style={display}>{r.label}</div>
                    <div className="text-[11px] text-gray-400">{r.desc}</div>
                  </motion.div>
                ))}
              </div>
              <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="mt-6 rounded-xl border border-border-subtle bg-surface-2 p-5">
                <p className="text-sm text-gray-300 text-center leading-relaxed">
                  <span className="text-green font-bold">The flywheel:</span> More communities on BagsStudio → more trading + engagement → swap fees + vault fees + subscriptions → revenue funds development + $STUDIO buybacks → $STUDIO value rises → more creators want featured placement → more communities.
                </p>
              </motion.div>
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
                Quests, staking, on-chain rewards, token locks, referrals, conviction scoring. Stop hoping your holders stay. Give them a reason to.
              </p>
              <a href="/studio" className="glow-green-intense group relative inline-block overflow-hidden rounded-full bg-green px-10 py-4 text-lg font-bold text-black transition-all hover:scale-[1.03]">
                <span className="relative z-10">Enter the Studio</span>
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border-subtle px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="BagsStudio" width={100} height={26} className="h-6 w-auto opacity-50" />
            <span className="text-xs text-gray-400">Built on Solana</span>
          </div>
          <div className="flex gap-8">
            {[
              { l: "bags.fm", h: "https://bags.fm" },
              { l: "X / Twitter", h: "https://x.com" },
              { l: "Docs", h: "https://docs.bags.fm" },
            ].map(link => (
              <a key={link.l} href={link.h} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 transition-colors hover:text-green" style={mono}>{link.l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
