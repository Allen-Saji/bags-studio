import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-black/60 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="BagsStudio"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </div>

        <div className="flex items-center gap-6">
          <a
            href="#features"
            className="hidden text-sm text-gray-500 transition-colors hover:text-white md:block"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hidden text-sm text-gray-500 transition-colors hover:text-white md:block"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            How it works
          </a>
          <a
            href="#"
            className="group relative overflow-hidden rounded-full bg-green px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-green-dark"
          >
            <span className="relative z-10">Open Studio</span>
            <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform group-hover:translate-x-full" />
          </a>
        </div>
      </div>
    </nav>
  );
}
