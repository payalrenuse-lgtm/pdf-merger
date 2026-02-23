"use client";

import { useCallback, useState } from "react";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";
import MergeButton from "@/components/MergeButton";
import Navbar from "@/components/Navbar";
import type { FileWithId } from "@/types";

function createFileWithId(file: File): FileWithId {
  return {
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
  };
}

export default function MergePage() {
  const [files, setFiles] = useState<FileWithId[]>([]);

  const handleFilesAccepted = useCallback((newFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...newFiles.map((f) => createFileWithId(f)),
    ]);
  }, []);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <Navbar />

      <header className="px-4 pt-8 pb-6 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
          Merge PDF
        </h1>
        <p className="mt-3 text-lg text-white/90 sm:text-xl">
          Combine multiple PDF files into one document
        </p>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white/95 px-6 py-8 shadow-2xl backdrop-blur-sm sm:px-8 sm:py-10">
          <div className="space-y-6">
            <FileUpload onFilesAccepted={handleFilesAccepted} />

            {files.length > 0 && (
              <>
                <FileList
                  files={files}
                  onReorder={handleReorder}
                  onRemove={handleRemove}
                />
                <MergeButton files={files} />
              </>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-white/80">
          Secure merging — your files are processed and never stored
        </p>
      </main>
    </div>
  );
}
