"use client";

import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/merge", label: "Merge PDF" },
  { href: "/split", label: "Split PDF" },
  { href: "/compress", label: "Compress PDF" },
  { href: "/pdf-to-jpg", label: "PDF to JPG" },
  { href: "/jpg-to-pdf", label: "JPG to PDF" },
];

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-12">
      <Link
        href="/"
        className="text-xl font-bold tracking-tight text-white drop-shadow-sm hover:text-white/90"
      >
        PDF Toolkit
      </Link>
      <div className="flex items-center gap-1 overflow-x-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <span className="hidden text-sm font-medium text-white/80 sm:inline">
        Fast • Secure • Free
      </span>
    </nav>
  );
}
