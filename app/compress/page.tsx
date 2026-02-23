"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import Navbar from "@/components/Navbar";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ original: number; compressed: number } | null>(null);

  const handleFilesAccepted = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to compress PDF");
      }

      const blob = await response.blob();
      const original = parseInt(response.headers.get("X-Original-Size") || "0", 10);
      const compressed = parseInt(response.headers.get("X-Compressed-Size") || String(blob.size), 10);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setResult({ original, compressed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compress PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <Navbar />

      <header className="px-4 pt-8 pb-6 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
          Compress PDF
        </h1>
        <p className="mt-3 text-lg text-white/90 sm:text-xl">
          Reduce file size while preserving quality
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
                    onClick={() => { setFile(null); setResult(null); }}
                    className="text-sm text-slate-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                {result && (
                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-800">Compression complete</p>
                    <p className="mt-1 text-sm text-green-700">
                      {formatSize(result.original)} → {formatSize(result.compressed)}
                      {result.compressed < result.original && (
                        <span className="ml-2 text-green-600">
                          (saved {formatSize(result.original - result.compressed)})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Compressing...
                    </>
                  ) : (
                    "Compress PDF"
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
