"use client";

import Navbar from "@/components/Navbar";
import ToolCard from "@/components/ToolCard";
import { tools } from "@/lib/tools";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <Navbar />

      <header className="px-4 pt-12 pb-8 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
          PDF Toolkit
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-white/90 sm:text-xl">
          Free online PDF tools — merge, split, compress, and convert. Fast, secure, and easy to use.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.href}
              href={tool.href}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
            />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-white/80">
          All processing happens securely — your files are never stored on our servers
        </p>
      </main>
    </div>
  );
}
