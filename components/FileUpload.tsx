"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection, DropEvent } from "react-dropzone";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export interface FileValidationError {
  file: string;
  reason: string;
}

export type AcceptType = "pdf" | "image";

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
  onValidationErrors?: (errors: FileValidationError[]) => void;
  disabled?: boolean;
  accept?: AcceptType;
}

const ACCEPT_CONFIG: Record<AcceptType, { accept: Record<string, string[]>; label: string }> = {
  pdf: { accept: { "application/pdf": [".pdf"] }, label: "PDF" },
  image: { accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }, label: "JPG, PNG" },
};

export default function FileUpload({
  onFilesAccepted,
  onValidationErrors,
  disabled = false,
  accept = "pdf",
}: FileUploadProps) {
  const [rejectedFiles, setRejectedFiles] = useState<FileValidationError[]>([]);
  const config = ACCEPT_CONFIG[accept];

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
      const validTypes = accept === "pdf"
        ? (f: File) => f.type === "application/pdf"
        : (f: File) => f.type === "image/jpeg" || f.type === "image/png";
      const filteredFiles = acceptedFiles.filter(validTypes);

      // Validate file sizes for accepted files
      const sizeErrors: FileValidationError[] = [];
      const validFiles: File[] = [];

      for (const file of filteredFiles) {
        if (file.size > MAX_FILE_SIZE) {
          sizeErrors.push({
            file: file.name,
            reason: `File exceeds 20MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
          });
        } else {
          validFiles.push(file);
        }
      }

      // Collect errors from react-dropzone fileRejections
      const rejectErrors: FileValidationError[] = fileRejections.map(({ file, errors }) => {
        const e = errors[0];
        let reason = "File was rejected";
        if (e?.code === "file-invalid-type") reason = `Invalid file type. Only ${config.label} files are allowed.`;
        else if (e?.code === "file-too-large") reason = "File exceeds 20MB limit";
        else if (e?.message) reason = e.message;
        return { file: file.name, reason };
      });

      const allErrors = [...sizeErrors, ...rejectErrors];
      setRejectedFiles(allErrors);
      onValidationErrors?.(allErrors);

      if (validFiles.length > 0) {
        onFilesAccepted(validFiles);
      }
    },
    [onFilesAccepted, onValidationErrors, accept, config]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.accept,
    multiple: true,
    maxSize: MAX_FILE_SIZE,
    disabled,
    noClick: disabled,
    noDrag: disabled,
  });

  const clearErrors = useCallback(() => setRejectedFiles([]), []);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          flex min-h-[260px] cursor-pointer flex-col items-center justify-center
          rounded-2xl border-2 border-dashed p-8 transition-all duration-300
          ${
            isDragActive
              ? "border-indigo-500 bg-indigo-50/80 shadow-inner"
              : "border-slate-300 bg-slate-50/80 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-md"
          }
          ${disabled ? "cursor-not-allowed opacity-60" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div
          className={`
            mb-4 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300
            ${isDragActive ? "bg-indigo-100" : "bg-slate-100"}
          `}
        >
          <svg
            className={`h-10 w-10 transition-colors ${
              isDragActive ? "text-indigo-600" : "text-slate-500"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p className="mb-1 text-center text-lg font-semibold text-slate-800">
          {isDragActive ? "Drop your files here" : accept === "pdf" ? "Drop PDF files here" : "Drop images here"}
        </p>
        <p className="text-center text-sm text-slate-500">
          or click to browse • {config.label} only • Max 20MB per file
        </p>
      </div>

      {rejectedFiles.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-red-800">
              Some files could not be added
            </span>
            <button
              type="button"
              onClick={clearErrors}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
          <ul className="space-y-1 text-sm text-red-700">
            {rejectedFiles.map((err, i) => (
              <li key={i}>
                <span className="font-medium">{err.file}</span>: {err.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
