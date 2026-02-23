"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAccepted = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const pdfjs = await import("pdfjs-dist/webpack.mjs");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;

      const blobs: Blob[] = [];

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");

        const renderTask = page.render({
          canvasContext: ctx,
          canvas,
          viewport,
        });
        await renderTask.promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
            "image/jpeg",
            0.92
          );
        });
        blobs.push(blob);
        setProgress((i / pageCount) * 100);
      }

      for (let i = 0; i < blobs.length; i++) {
        const url = URL.createObjectURL(blobs[i]);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name.replace(/\.pdf$/i, "")}-page-${i + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert PDF to images");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [file]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <Navbar />

      <header className="px-4 pt-8 pb-6 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
          PDF to JPG
        </h1>
        <p className="mt-3 text-lg text-white/90 sm:text-xl">
          Convert PDF pages to high-quality images
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
                    disabled={isProcessing}
                    className="text-sm text-slate-500 hover:text-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                {isProcessing && (
                  <ProgressBar value={progress} label="Converting pages..." />
                )}

                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Converting...
                    </>
                  ) : (
                    "Convert to JPG"
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
