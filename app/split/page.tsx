"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import Navbar from "@/components/Navbar";

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [range, setRange] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAccepted = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  };

  const handleSplit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("range", range || "all");

      const response = await fetch("/api/split", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to split PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "split.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to split PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <Navbar />

      <header className="px-4 pt-8 pb-6 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
          Split PDF
        </h1>
        <p className="mt-3 text-lg text-white/90 sm:text-xl">
          Extract selected pages from your PDF
        </p>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white/95 px-6 py-8 shadow-2xl backdrop-blur-sm sm:px-8 sm:py-10">
          <div className="space-y-6">
            <FileUpload
              onFilesAccepted={handleFilesAccepted}
              onValidationErrors={() => setError(null)}
            />

            {file && (
              <>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="truncate text-sm font-medium text-slate-700">{file.name}</p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-sm text-slate-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Page range (e.g., 1,3,5 or 1-5 or leave empty for all)
                  </label>
                  <input
                    type="text"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    placeholder="1,3,5 or 1-10"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Examples: 1,3,5 (pages 1, 3, 5) | 1-5 (pages 1 through 5)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Splitting...
                    </>
                  ) : (
                    "Split PDF"
                  )}
                </button>
              </>
            )}

            {error && (
              <p className="text-center text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
