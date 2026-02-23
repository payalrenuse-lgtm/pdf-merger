"use client";

import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FilePreviewProps {
  file: File;
  index: number;
  onRemove: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

export default function FilePreview({
  file,
  index,
  onRemove,
  dragHandleProps,
  isDragging = false,
}: FilePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      try {
        const pdfjs = await import("pdfjs-dist/webpack.mjs");
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        const numPages = pdf.numPages;
        setPageCount(numPages);

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderTask = page.render({
          canvasContext: context,
          canvas,
          viewport,
        });
        await renderTask.promise;
      } catch (err) {
        if (!cancelled) {
          setPreviewError("Preview unavailable");
        }
      }
    };

    if (file.type === "application/pdf" && file.size <= MAX_FILE_SIZE) {
      loadPreview();
    } else if (file.size > MAX_FILE_SIZE) {
      setPreviewError("File too large");
    }

    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <div
      className={`
        group flex items-center gap-4 rounded-xl border border-slate-200 bg-white
        px-4 py-3 shadow-md transition-all duration-200
        ${isDragging ? "scale-[0.98] opacity-90 shadow-xl" : "hover:shadow-lg"}
      `}
    >
      {/* Drag handle */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="flex shrink-0 cursor-grab touch-none flex-col items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>
      )}

      {/* Thumbnail */}
      <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {previewError ? (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-8 w-8 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        ) : (
          <canvas ref={canvasRef} className="max-h-full max-w-full object-contain" />
        )}
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-800">{file.name}</p>
        <div className="mt-0.5 flex items-center gap-3 text-sm text-slate-500">
          <span>{formatFileSize(file.size)}</span>
          {pageCount !== null && (
            <>
              <span>•</span>
              <span>{pageCount} page{pageCount !== 1 ? "s" : ""}</span>
            </>
          )}
        </div>
      </div>

      {/* Order badge */}
      <span className="shrink-0 text-sm font-semibold text-indigo-600">
        #{index + 1}
      </span>

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="rounded-xl p-2.5 text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
        aria-label="Remove file"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
