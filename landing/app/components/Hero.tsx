import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-20">
      {/* Background grid */}
      <div className="grid-pattern absolute inset-0" />

      {/* Central glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-green/[0.04] blur-[150px]" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 lg:flex-row lg:items-center lg:gap-12 lg:pt-28">
        {/* Left content */}
        <div className="flex-1 text-center lg:text-left">
          {/* Eyebrow */}
          <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-green/20 bg-green/[0.06] px-4 py-2">
            <span className="animate-pulse-dot inline-block h-2 w-2 rounded-full bg-green" />
            <span
              className="text-xs tracking-[0.2em] text-green uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Post-Launch Creator Tooling
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up animate-delay-100 mb-8 text-5xl leading-[1.05] font-extrabold tracking-[-0.03em] md:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Turn launch hype
            <br />
            into <span className="text-glow text-green">lasting</span>
            <br />
            <span className="text-glow text-green">momentum</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up animate-delay-200 mb-10 max-w-lg text-lg leading-relaxed text-gray-400 lg:text-xl">
            The creator studio for life after launch — identify real
            supporters, run momentum campaigns, and reward the wallets keeping
            your coin alive.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up animate-delay-300 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#"
              className="glow-green-sm group relative overflow-hidden rounded-full bg-green px-8 py-4 text-center text-base font-bold text-black transition-all hover:scale-[1.02]"
            >
              <span className="relative z-10">Open Studio</span>
            </a>
            <a
              href="#features"
              className="rounded-full border border-border-strong px-8 py-4 text-center text-base font-medium text-gray-400 transition-all hover:border-green/30 hover:text-white"
            >
              Explore Features
            </a>
          </div>

          {/* Stats strip */}
          <div className="animate-fade-in-up animate-delay-400 mt-14 flex justify-center gap-8 border-t border-border-subtle pt-8 lg:justify-start">
            {[
              { value: "100%", label: "Bags Native" },
              { value: "Real-time", label: "Conviction Scoring" },
              { value: "On-chain", label: "Reward Distribution" },
            ].map((stat) => (
              <div key={stat.label} className="text-center lg:text-left">
                <div
                  className="text-sm font-bold text-green"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Mascot + floating UI */}
        <div className="animate-fade-in-up animate-delay-300 relative mt-16 flex-1 lg:mt-0">
          {/* Glow behind mascot */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green/[0.08] blur-[100px]" />

          {/* Mascot */}
          <div className="animate-float relative mx-auto w-[320px] md:w-[420px] lg:w-[480px]">
            <Image
              src="/mascot.png"
              alt="BagsStudio Mascot"
              width={480}
              height={480}
              className="relative z-10 drop-shadow-[0_0_60px_rgba(0,230,118,0.2)]"
              priority
            />
          </div>

          {/* Floating stat card — top right */}
          <div className="animate-fade-in-up animate-delay-400 absolute right-0 top-4 z-20 rounded-xl border border-green/20 bg-black/80 px-4 py-3 backdrop-blur-xl md:right-[-10px]">
            <div
              className="text-[10px] text-gray-500 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Conviction Score
            </div>
            <div
              className="text-2xl font-bold text-green"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              94.7
            </div>
            <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-border-strong">
              <div className="h-full w-[94%] rounded-full bg-green" />
            </div>
          </div>

          {/* Floating card — bottom left */}
          <div className="animate-fade-in-up animate-delay-400 absolute bottom-8 left-0 z-20 rounded-xl border border-green/20 bg-black/80 px-4 py-3 backdrop-blur-xl md:left-[-20px]">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green" />
              <span
                className="text-[10px] text-gray-400"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                +23 supporters today
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {[40, 65, 45, 80, 60, 90, 75, 85, 70, 95].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-sm bg-green/40"
                  style={{ height: `${h * 0.24}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span
            className="text-[10px] tracking-widest text-gray-600 uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Scroll
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-green/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
