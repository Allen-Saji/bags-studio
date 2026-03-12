import InView from "./InView";

const features = [
  {
    tag: "Supporter Map",
    title: "Know who's really backing the coin",
    description:
      "Use the Supporter Map and Conviction Score to see which wallets are early, loyal, active, and still driving momentum.",
    visual: (
      <div className="relative h-48 overflow-hidden rounded-lg bg-black/60 p-4">
        <div className="space-y-2.5">
          {[
            { rank: 1, score: 97, tier: "OG", w: "92%" },
            { rank: 2, score: 89, tier: "Champion", w: "84%" },
            { rank: 3, score: 82, tier: "Loyal", w: "76%" },
            { rank: 4, score: 71, tier: "Active", w: "65%" },
            { rank: 5, score: 58, tier: "Catalyst", w: "52%" },
          ].map((row) => (
            <div key={row.rank} className="flex items-center gap-3">
              <span className="w-5 text-right text-[10px] text-gray-600" style={{ fontFamily: "var(--font-mono)" }}>
                #{row.rank}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-strong">
                <div className="h-full rounded-full bg-gradient-to-r from-green/50 to-green" style={{ width: row.w }} />
              </div>
              <span className="w-7 text-right text-[10px] font-bold text-green" style={{ fontFamily: "var(--font-mono)" }}>{row.score}</span>
              <span className="w-16 rounded-full bg-green-muted px-2 py-0.5 text-center text-[9px] text-green">{row.tier}</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent" />
      </div>
    ),
  },
  {
    tag: "Campaigns",
    title: "Run campaigns that bring people back",
    description:
      "Launch momentum campaigns that give supporters a reason to return, participate, and stay engaged after launch.",
    visual: (
      <div className="relative h-48 overflow-hidden rounded-lg bg-black/60 p-4">
        <div className="rounded-lg border border-green/20 bg-surface-2 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-muted">
                <span className="text-[10px] text-green">&#9650;</span>
              </div>
              <span className="text-xs font-bold">Top Supporters</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-green" style={{ fontFamily: "var(--font-mono)" }}>
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
              Live
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["Eligible", "Claimed", "Remaining"].map((label, i) => (
              <div key={label} className="rounded-md bg-black/60 p-2 text-center">
                <div className="text-sm font-bold text-green" style={{ fontFamily: "var(--font-mono)" }}>{["847", "312", "535"][i]}</div>
                <div className="text-[9px] text-gray-600">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-strong">
            <div className="shimmer h-full w-[37%] rounded-full bg-green" />
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: "Reward Sets",
    title: "Reward real supporters",
    description:
      "Create reward sets for the wallets that matter most — not just the loudest, but the ones keeping the coin alive.",
    visual: (
      <div className="relative h-48 overflow-hidden rounded-lg bg-black/60 p-4">
        <div className="space-y-2.5">
          {[
            { tier: "Champion", pct: "Top 1%", count: 12, opacity: 1 },
            { tier: "Catalyst", pct: "Top 5%", count: 48, opacity: 0.85 },
            { tier: "Loyal", pct: "Top 15%", count: 156, opacity: 0.7 },
            { tier: "Active", pct: "Top 40%", count: 421, opacity: 0.55 },
            { tier: "OG", pct: "Top 60%", count: 610, opacity: 0.4 },
          ].map((tier) => (
            <div key={tier.tier} className="flex items-center gap-3">
              <div className="h-6 w-1.5 rounded-full bg-green" style={{ opacity: tier.opacity }} />
              <span className="w-20 text-xs font-bold">{tier.tier}</span>
              <span className="text-[10px] text-gray-600" style={{ fontFamily: "var(--font-mono)" }}>{tier.pct}</span>
              <div className="flex-1" />
              <span className="text-[10px] text-gray-500" style={{ fontFamily: "var(--font-mono)" }}>{tier.count} wallets</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent" />
      </div>
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="relative px-6 py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-3xl">
          <InView>
            <p className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              Core Features
            </p>
          </InView>
          <InView delay={50}>
            <h2 className="mb-6 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
              A creator control room for{" "}
              <span className="text-green">everything after launch</span>
            </h2>
          </InView>
          <InView delay={100}>
            <p className="text-lg text-gray-400">
              Understand supporter behavior, run community activations, and
              reward the wallets actually sustaining momentum.
            </p>
          </InView>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {features.map((feature, i) => (
            <InView key={feature.tag} delay={i * 120}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border-subtle bg-surface transition-all hover:border-green/20">
                <div className="relative scanlines">{feature.visual}</div>
                <div className="p-6">
                  <span className="mb-3 inline-block rounded-full border border-green/20 bg-green-muted px-3 py-1 text-[10px] tracking-widest text-green uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    {feature.tag}
                  </span>
                  <h3 className="mb-3 text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-green/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </InView>
          ))}
        </div>
      </div>
    </section>
  );
}
