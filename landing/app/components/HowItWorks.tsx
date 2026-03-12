import InView from "./InView";

const steps = [
  { number: "01", title: "Connect your Bags coin", description: "Select your coin and link your creator profile to the studio." },
  { number: "02", title: "See supporter tiers & momentum", description: "View conviction scores, supporter segments, and community health." },
  { number: "03", title: "Launch a campaign", description: "Create momentum campaigns that activate and engage your community." },
  { number: "04", title: "Track eligibility & rankings", description: "Supporters connect wallets to check score, tier, and standing." },
  { number: "05", title: "Reward momentum", description: "Distribute rewards to the wallets actually sustaining your coin." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <InView>
            <p className="mb-4 text-xs tracking-[0.3em] text-green uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              Product Flow
            </p>
          </InView>
          <InView delay={50}>
            <h2 className="text-4xl font-extrabold tracking-[-0.02em] md:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
              How it works
            </h2>
          </InView>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-green/40 via-green/20 to-transparent md:left-10" />

          <div className="flex flex-col gap-4">
            {steps.map((step, i) => (
              <InView key={step.number} delay={i * 80}>
                <div className="group relative flex gap-6 md:gap-8">
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-green/30 bg-black md:h-20 md:w-20">
                    <span className="text-lg font-bold text-green md:text-xl" style={{ fontFamily: "var(--font-mono)" }}>{step.number}</span>
                    <div className="absolute inset-0 rounded-full border border-green/10 opacity-0 transition-all group-hover:scale-125 group-hover:opacity-100" />
                  </div>
                  <div className="flex-1 rounded-xl border border-border-subtle bg-surface p-6 transition-all group-hover:border-green/15 group-hover:bg-surface-2">
                    <h3 className="mb-2 text-lg font-bold tracking-tight md:text-xl" style={{ fontFamily: "var(--font-display)" }}>{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              </InView>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
