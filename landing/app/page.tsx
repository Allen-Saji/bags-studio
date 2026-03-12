"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

const painPoints = [
  "No real supporter visibility",
  "No structured community campaigns",
  "No clear reward system for loyal backers",
  "No post-launch operating layer",
];

const features = [
  {
    tag: "Supporter Map",
    title: "Know who\u2019s really backing the coin",
    description: "Use the Supporter Map and Conviction Score to see which wallets are early, loyal, active, and still driving momentum.",
    rows: [
      { rank: 1, score: 97, tier: "OG", w: "92%" },
      { rank: 2, score: 89, tier: "Champion", w: "84%" },
      { rank: 3, score: 82, tier: "Loyal", w: "76%" },
      { rank: 4, score: 71, tier: "Active", w: "65%" },
      { rank: 5, score: 58, tier: "Catalyst", w: "52%" },
    ],
  },
  {
    tag: "Campaigns",
    title: "Run campaigns that bring people back",
    description: "Launch momentum campaigns that give supporters a reason to return, participate, and stay engaged after launch.",
    stats: [
      { label: "Eligible", value: "847" },
      { label: "Claimed", value: "312" },
      { label: "Remaining", value: "535" },
    ],
  },
  {
    tag: "Reward Sets",
    title: "Reward real supporters",
    description: "Create reward sets for the wallets that matter most \u2014 not just the loudest, but the ones keeping the coin alive.",
    tiers: [
      { name: "Champion", pct: "Top 1%", count: 12, opacity: 1 },
      { name: "Catalyst", pct: "Top 5%", count: 48, opacity: 0.85 },
      { name: "Loyal", pct: "Top 15%", count: 156, opacity: 0.7 },
      { name: "Active", pct: "Top 40%", count: 421, opacity: 0.55 },
      { name: "OG", pct: "Top 60%", count: 610, opacity: 0.4 },
    ],
  },
];

const transforms = [
  { from: "Hype", to: "Community", img: "/hype-community.png" },
  { from: "Holders", to: "Supporters", img: "/holders-sopprters.png" },
  { from: "Activity", to: "Momentum", img: "/activity-momentum.png" },
];

const steps = [
  { n: "01", title: "Connect your Bags coin", desc: "Select your coin and link your creator profile to the studio." },
  { n: "02", title: "See supporter tiers & momentum", desc: "View conviction scores, supporter segments, and community health." },
  { n: "03", title: "Launch a campaign", desc: "Create momentum campaigns that activate and engage your community." },
  { n: "04", title: "Track eligibility & rankings", desc: "Supporters connect wallets to check score, tier, and standing." },
  { n: "05", title: "Reward momentum", desc: "Distribute rewards to the wallets actually sustaining your coin." },
];

const mono = { fontFamily: "var(--font-mono)" };
const display = { fontFamily: "var(--font-display)" };

export default function Home() {
  return (
    <>
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Image src="/logo.png" alt="BagsStudio" width={160} height={40} className="h-10 w-auto" priority />
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden text-sm text-gray-500 transition-colors hover:text-white md:block" style={mono}>Features</a>
            <a href="#how-it-works" className="hidden text-sm text-gray-500 transition-colors hover:text-white md:block" style={mono}>How it works</a>
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
                <span className="text-xs tracking-[0.2em] text-green uppercase" style={mono}>Post-Launch Creator Tooling</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="mb-8 text-5xl leading-[1.05] font-extrabold tracking-[-0.03em] md:text-6xl lg:text-7xl" style={display}>
                Turn launch hype<br />into <span className="text-glow text-green">lasting</span><br /><span className="text-glow text-green">momentum</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                className="mb-10 max-w-lg text-lg leading-relaxed text-gray-400 lg:text-xl">
                The creator studio for life after launch — identify real supporters, run momentum campaigns, and reward the wallets keeping your coin alive.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <a href="/studio" className="glow-green-sm rounded-full bg-green px-8 py-4 text-center text-base font-bold text-black transition-all hover:scale-[1.02]">Open Studio</a>
                <a href="#features" className="rounded-full border border-border-strong px-8 py-4 text-center text-base font-medium text-gray-400 transition-all hover:border-green/30 hover:text-white">Explore Features</a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-14 flex justify-center gap-8 border-t border-border-subtle pt-8 lg:justify-start">
                {[{ v: "100%", l: "Bags Native" }, { v: "Real-time", l: "Conviction Scoring" }, { v: "On-chain", l: "Reward Distribution" }].map(s => (
                  <div key={s.l} className="text-center lg:text-left">
                    <div className="text-sm font-bold text-green" style={mono}>{s.v}</div>
                    <div className="mt-1 text-xs text-gray-600">{s.l}</div>
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
              <div className="absolute right-0 top-4 z-20 rounded-xl border border-green/20 bg-black/80 px-4 py-3 backdrop-blur-xl md:right-[-10px]">
                <div className="text-[10px] text-gray-500 uppercase" style={mono}>Conviction Score</div>
                <div className="text-2xl font-bold text-green" style={mono}>94.7</div>
                <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-border-strong"><div className="h-full w-[94%] rounded-full bg-green" /></div>
              </div>
              <div className="absolute bottom-8 left-0 z-20 rounded-xl border border-green/20 bg-black/80 px-4 py-3 backdrop-blur-xl md:left-[-20px]">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green" />
                  <span className="text-[10px] text-gray-400" style={mono}>+23 supporters today</span>
                </div>
                <div className="mt-2 flex gap-1">
                  {[40, 65, 45, 80, 60, 90, 75, 85, 70, 95].map((h, i) => (
                    <div key={i} className="w-2 rounded-sm bg-green/40" style={{ height: `${h * 0.24}px` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-[10px] tracking-widest text-gray-600 uppercase" style={mono}>Scroll</span>
            <div className="h-8 w-px bg-gradient-to-b from-green/40 to-transparent" />
          </div>
        </section>

        {/* ─── PROBLEM ─── */}
        <section className="relative px-6 py-28">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green/20 to-transparent" />
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
              <div className="lg:col-span-2">
                <motion.p {...fadeUp} className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={mono}>The Problem</motion.p>
                <motion.h2 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] md:text-5xl" style={display}>
                  Most coins<br />launch.<br /><span className="text-gray-600">Few stay alive.</span>
                </motion.h2>
                <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="mt-6 text-base leading-relaxed text-gray-500">
                  Launch gets attention. Momentum fades fast. After the coin goes live, creators are left without the tools to keep going.
                </motion.p>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-3">
                {painPoints.map((point, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="group rounded-xl border border-border-subtle bg-surface p-5 transition-all hover:border-red/20 hover:bg-surface-2">
                    <div className="flex items-center gap-5">
                      <span className="shrink-0 text-sm font-bold text-gray-600" style={mono}>{String(i + 1).padStart(2, "0")}</span>
                      <div className="h-px flex-1 bg-border-subtle transition-colors group-hover:bg-red/20" />
                      <span className="text-sm text-gray-400 transition-colors group-hover:text-gray-300">{point}</span>
                      <span className="inline-block h-2 w-2 rounded-full bg-red/60 transition-colors group-hover:bg-red" />
                    </div>
                  </motion.div>
                ))}
                <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.35 }} className="mt-4 rounded-xl border border-green/20 bg-green-muted p-6 text-center">
                  <p className="text-base text-gray-400">Most tools stop at launch. <span className="font-bold text-green">BagsStudio starts there.</span></p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="relative px-6 py-28">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 max-w-3xl">
              <motion.p {...fadeUp} className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={mono}>Core Features</motion.p>
              <motion.h2 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="mb-6 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={display}>
                A creator control room for <span className="text-green">everything after launch</span>
              </motion.h2>
              <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-gray-400">
                Understand supporter behavior, run community activations, and reward the wallets actually sustaining momentum.
              </motion.p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div key={f.tag} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="group overflow-hidden rounded-2xl border border-border-subtle bg-surface transition-all hover:border-green/20">
                  <div className="relative h-48 overflow-hidden rounded-t-lg bg-black/60 p-4 scanlines">
                    {f.rows && (
                      <div className="space-y-2.5">
                        {f.rows.map(r => (
                          <div key={r.rank} className="flex items-center gap-3">
                            <span className="w-5 text-right text-[10px] text-gray-600" style={mono}>#{r.rank}</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-strong"><div className="h-full rounded-full bg-gradient-to-r from-green/50 to-green" style={{ width: r.w }} /></div>
                            <span className="w-7 text-right text-[10px] font-bold text-green" style={mono}>{r.score}</span>
                            <span className="w-16 rounded-full bg-green-muted px-2 py-0.5 text-center text-[9px] text-green">{r.tier}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {f.stats && (
                      <div className="rounded-lg border border-green/20 bg-surface-2 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Top Supporters</span>
                          <span className="flex items-center gap-1 text-[10px] text-green" style={mono}><span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green" />Live</span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {f.stats.map(s => (
                            <div key={s.label} className="rounded-md bg-black/60 p-2 text-center">
                              <div className="text-sm font-bold text-green" style={mono}>{s.value}</div>
                              <div className="text-[9px] text-gray-600">{s.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-strong"><div className="shimmer h-full w-[37%] rounded-full bg-green" /></div>
                      </div>
                    )}
                    {f.tiers && (
                      <div className="space-y-2.5">
                        {f.tiers.map(t => (
                          <div key={t.name} className="flex items-center gap-3">
                            <div className="h-6 w-1.5 rounded-full bg-green" style={{ opacity: t.opacity }} />
                            <span className="w-20 text-xs font-bold">{t.name}</span>
                            <span className="text-[10px] text-gray-600" style={mono}>{t.pct}</span>
                            <div className="flex-1" />
                            <span className="text-[10px] text-gray-500" style={mono}>{t.count} wallets</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent" />
                  </div>
                  <div className="p-6">
                    <span className="mb-3 inline-block rounded-full border border-green/20 bg-green-muted px-3 py-1 text-[10px] tracking-widest text-green uppercase" style={mono}>{f.tag}</span>
                    <h3 className="mb-3 text-xl font-bold tracking-tight" style={display}>{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHY IT MATTERS ─── */}
        <section className="relative overflow-hidden px-6 py-28">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          <div className="relative z-10 mx-auto max-w-5xl">
            <div className="text-center">
              <motion.p {...fadeUp} className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={mono}>Why It Matters</motion.p>
              <motion.h2 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="mb-6 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={display}>
                Launch is a moment.<br /><span className="text-green">Community is the product.</span>
              </motion.h2>
              <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="mx-auto mb-20 max-w-xl text-lg text-gray-500">
                The strongest coins don&apos;t just launch well. They keep people engaged after the first spike.
              </motion.p>
            </div>

            {/* Transform cards */}
            <div className="grid gap-8 md:grid-cols-3">
              {transforms.map((t, i) => (
                <motion.div key={t.from} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface transition-all hover:border-green/20 hover:bg-surface-2">
                  {/* Illustration */}
                  <div className="relative flex items-center justify-center overflow-hidden bg-black/40 px-6 pt-8 pb-4">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-green/[0.03] to-transparent" />
                    <Image
                      src={t.img}
                      alt={`${t.from} to ${t.to}`}
                      width={400}
                      height={300}
                      className="relative z-10 h-44 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,230,118,0.1)] transition-transform duration-500 group-hover:scale-105 md:h-52"
                    />
                  </div>

                  {/* Labels */}
                  <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] tracking-widest text-gray-600 uppercase" style={mono}>{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-lg font-extrabold text-gray-500 line-through decoration-gray-600/50" style={display}>{t.from}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-gray-600" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-green/30 to-transparent" />
                      <span className="text-glow text-2xl font-extrabold text-green" style={display}>{t.to}</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-muted">
                        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-green" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
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
              <motion.p {...fadeUp} className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={mono}>Product Flow</motion.p>
              <motion.h2 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={display}>How it works</motion.h2>
            </div>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-green/40 via-green/20 to-transparent md:left-10" />
              <div className="flex flex-col gap-4">
                {steps.map((s, i) => (
                  <motion.div key={s.n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="group relative flex gap-6 md:gap-8">
                    <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-green/30 bg-black md:h-20 md:w-20">
                      <span className="text-lg font-bold text-green md:text-xl" style={mono}>{s.n}</span>
                    </div>
                    <div className="flex-1 rounded-xl border border-border-subtle bg-surface p-6 transition-all group-hover:border-green/15 group-hover:bg-surface-2">
                      <h3 className="mb-2 text-lg font-bold tracking-tight md:text-xl" style={display}>{s.title}</h3>
                      <p className="text-sm text-gray-500">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
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
                Build what comes<br /><span className="text-glow text-green">after launch</span>
              </h2>
              <p className="mx-auto mb-12 max-w-xl text-lg text-gray-500">BagsStudio gives Bags creators the tools to grow community, reward conviction, and keep momentum alive.</p>
              <a href="/studio" className="glow-green-intense group relative inline-block overflow-hidden rounded-full bg-green px-10 py-4 text-lg font-bold text-black transition-all hover:scale-[1.03]">
                <span className="relative z-10">Enter the Studio</span>
              </a>
              <div className="mt-16 flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-border-subtle" /><span className="text-[10px] tracking-[0.3em] text-gray-600 uppercase" style={mono}>Powered by Bags</span><div className="h-px w-12 bg-border-subtle" />
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
            <span className="text-xs text-gray-600">Bags Hackathon 2025</span>
          </div>
          <div className="flex gap-8">
            {[{ l: "bags.fm", h: "https://bags.fm" }, { l: "Docs", h: "https://docs.bags.fm" }, { l: "Discord", h: "https://discord.gg/bagsapp" }].map(link => (
              <a key={link.l} href={link.h} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 transition-colors hover:text-green" style={mono}>{link.l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
