import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="BagsStudio"
            width={100}
            height={26}
            className="h-6 w-auto opacity-50"
          />
          <span className="text-xs text-gray-600">
            Bags Hackathon 2025
          </span>
        </div>
        <div className="flex gap-8">
          {[
            { label: "bags.fm", href: "https://bags.fm" },
            { label: "Docs", href: "https://docs.bags.fm" },
            { label: "Discord", href: "https://discord.gg/bagsapp" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 transition-colors hover:text-green"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
