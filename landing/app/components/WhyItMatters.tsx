import InView from "./InView";

const transforms = [
  { from: "Hype", to: "Community" },
  { from: "Holders", to: "Supporters" },
  { from: "Activity", to: "Momentum" },
];

export default function WhyItMatters() {
  return (
    <section className="relative overflow-hidden px-6 py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="text-center">
          <InView>
            <p className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              Why It Matters
            </p>
          </InView>
          <InView delay={50}>
            <h2 className="mb-6 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
              Launch is a moment.
              <br />
              <span className="text-green">Community is the product.</span>
            </h2>
          </InView>
          <InView delay={100}>
            <p className="mx-auto mb-16 max-w-xl text-lg text-gray-500">
              The strongest coins don&apos;t just launch well. They keep people
              engaged after the first spike.
            </p>
          </InView>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {transforms.map((t, i) => (
            <InView key={t.from} delay={i * 120}>
              <div className="group rounded-2xl border border-border-subtle bg-surface p-8 text-center transition-all hover:border-green/20">
                <div className="mb-6 flex flex-col items-center gap-4">
                  <div className="rounded-xl border border-border-strong bg-elevated px-6 py-3">
                    <div className="text-[10px] tracking-widest text-gray-600 uppercase" style={{ fontFamily: "var(--font-mono)" }}>Before</div>
                    <div className="mt-1 text-2xl font-extrabold text-gray-500" style={{ fontFamily: "var(--font-display)" }}>{t.from}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-px bg-green/30" />
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-green" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                    </svg>
                  </div>
                  <div className="rounded-xl border border-green/20 bg-green-muted px-6 py-3">
                    <div className="text-[10px] tracking-widest text-green uppercase" style={{ fontFamily: "var(--font-mono)" }}>After</div>
                    <div className="text-glow mt-1 text-2xl font-extrabold text-green" style={{ fontFamily: "var(--font-display)" }}>{t.to}</div>
                  </div>
                </div>
              </div>
            </InView>
          ))}
        </div>
      </div>
    </section>
  );
}
