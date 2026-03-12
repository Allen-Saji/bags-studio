import Image from "next/image";
import InView from "./InView";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-28">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 translate-y-1/3 rounded-full bg-green/[0.04] blur-[150px]" />
        <div className="grid-pattern absolute inset-0 opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <InView>
          <div className="mx-auto mb-10 w-24 md:w-32">
            <Image
              src="/mascot.png"
              alt="BagsStudio"
              width={128}
              height={128}
              className="drop-shadow-[0_0_40px_rgba(0,230,118,0.15)]"
            />
          </div>
        </InView>

        <InView delay={100}>
          <div className="text-center">
            <h2 className="mb-6 text-4xl font-extrabold tracking-[-0.02em] md:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-display)" }}>
              Build what comes
              <br />
              <span className="text-glow text-green">after launch</span>
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-lg text-gray-500">
              BagsStudio gives Bags creators the tools to grow community, reward
              conviction, and keep momentum alive.
            </p>

            <a
              href="#"
              className="glow-green-intense group relative inline-block overflow-hidden rounded-full bg-green px-10 py-4 text-lg font-bold text-black transition-all hover:scale-[1.03]"
            >
              <span className="relative z-10">Enter the Studio</span>
              <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
            </a>

            <div className="mt-16 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-border-subtle" />
              <span className="text-[10px] tracking-[0.3em] text-gray-600 uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                Powered by Bags
              </span>
              <div className="h-px w-12 bg-border-subtle" />
            </div>
          </div>
        </InView>
      </div>
    </section>
  );
}
