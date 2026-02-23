"use client";

import { useState } from "react";
import type { FileWithId } from "@/types";
import { formatFileSize } from "./FilePreview";

interface MergeButtonProps {
  files: FileWithId[];
  disabled?: boolean;
}

export default function MergeButton({
  files,
  disabled = false,
}: MergeButtonProps) {
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ fileSize: number } | null>(null);

  const handleMerge = async () => {
    if (files.length === 0 || disabled) return;

    setIsMerging(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      for (const { file } of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to merge PDFs");
      }

      const blob = await response.blob();
      const fileSize = blob.size;
      const mergedSizeHeader = response.headers.get("X-Merged-File-Size");
      const size = mergedSizeHeader ? parseInt(mergedSizeHeader, 10) : fileSize;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess({ fileSize: size });
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge PDFs");
    } finally {
      setIsMerging(false);
    }
  };

  const isDisabled = disabled || files.length < 2 || isMerging;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleMerge}
        disabled={isDisabled}
        className={`
          flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4
          text-lg font-semibold text-white shadow-lg transition-all duration-300
          hover:shadow-xl active:scale-[0.98]
          disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg
          ${
            isDisabled
              ? "bg-slate-400"
              : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500"
          }
        `}
      >
        {isMerging ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Merging PDFs...
          </>
        ) : (
          <>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            Merge PDF
          </>
        )}
      </button>

      {files.length === 1 && (
        <p className="text-center text-sm text-amber-600">
          Add at least one more PDF to merge
        </p>
      )}

      {success && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-sm font-medium text-green-800">
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>
            Merge complete! Downloaded merged.pdf ({formatFileSize(success.fileSize)})
          </span>
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
