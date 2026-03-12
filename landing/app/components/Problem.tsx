

const painPoints = [
  { text: "No real supporter visibility", icon: "01" },
  { text: "No structured community campaigns", icon: "02" },
  { text: "No clear reward system for loyal backers", icon: "03" },
  { text: "No post-launch operating layer", icon: "04" },
];

export default function Problem() {
  return (
    <section className="relative px-6 py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green/20 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Left */}
          <div className="lg:col-span-2">
            <div>
              <p
                className="mb-4 text-xs tracking-[0.3em] text-green uppercase"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                The Problem
              </p>
            </div>
            <div>
              <h2
                className="text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] md:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Most coins
                <br />
                launch.
                <br />
                <span className="text-gray-600">Few stay alive.</span>
              </h2>
            </div>
            <div>
              <p className="mt-6 text-base leading-relaxed text-gray-500">
                Launch gets attention. Momentum fades fast. After the coin goes
                live, creators are left without the tools to keep going.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            {painPoints.map((point, i) => (
              <div>
                <div className="group relative overflow-hidden rounded-xl border border-border-subtle bg-surface p-5 transition-all hover:border-red/20 hover:bg-surface-2">
                  <div className="flex items-center gap-5">
                    <span
                      className="shrink-0 text-sm font-bold text-gray-600"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {point.icon}
                    </span>
                    <div className="h-px flex-1 bg-border-subtle transition-colors group-hover:bg-red/20" />
                    <span className="text-sm text-gray-400 transition-colors group-hover:text-gray-300">
                      {point.text}
                    </span>
                    <span className="inline-block h-2 w-2 rounded-full bg-red/60 transition-colors group-hover:bg-red" />
                  </div>
                </div>
              </div>
            ))}

            <div>
              <div className="mt-4 rounded-xl border border-green/20 bg-green-muted p-6 text-center">
                <p className="text-base text-gray-400">
                  Most tools stop at launch.{" "}
                  <span className="font-bold text-green">
                    BagsStudio starts there.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
