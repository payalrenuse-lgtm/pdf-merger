"use client";

import Link from "next/link";

interface ToolCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function ToolCard({
  href,
  icon,
  title,
  description,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-slate-500">{description}</p>
    </Link>
  );
}
