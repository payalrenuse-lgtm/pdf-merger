"use client";

import { useCallback, useState } from "react";
import FileUpload from "@/components/FileUpload";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/ProgressBar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ImageWithId {
  id: string;
  file: File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SortableImage({ item, index, onRemove }: { item: ImageWithId; index: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-md ${isDragging ? "opacity-90" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-1 text-slate-400 hover:text-indigo-600"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </div>
      <img
        src={URL.createObjectURL(item.file)}
        alt=""
        className="h-12 w-12 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-800">{item.file.name}</p>
        <p className="text-sm text-slate-500">{formatSize(item.file.size)}</p>
      </div>
      <span className="text-sm font-semibold text-indigo-600">#{index + 1}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageWithId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAccepted = useCallback((files: File[]) => {
    setImages((prev) => [
      ...prev,
      ...files.map((f) => ({ id: `${f.name}-${Date.now()}-${Math.random()}`, file: f })),
    ]);
    setError(null);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleReorder = useCallback((from: number, to: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      return next;
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = images.findIndex((i) => i.id === active.id);
    const newIdx = images.findIndex((i) => i.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) handleReorder(oldIdx, newIdx);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      images.forEach(({ file }) => formData.append("files", file));

      const response = await fetch("/api/jpg-to-pdf", { method: "POST", body: formData });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <Navbar />

      <header className="px-4 pt-8 pb-6 text-center sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl">
          JPG to PDF
        </h1>
        <p className="mt-3 text-lg text-white/90 sm:text-xl">
          Convert images into a single PDF document
        </p>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white/95 px-6 py-8 shadow-2xl backdrop-blur-sm sm:px-8 sm:py-10">
          <div className="space-y-6">
            <FileUpload onFilesAccepted={handleFilesAccepted} accept="image" />

            {images.length > 0 && (
              <>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={images.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-600">{images.length} image(s) ready</p>
                      <ul className="space-y-2">
                        {images.map((item, idx) => (
                          <li key={item.id}>
                            <SortableImage item={item} index={idx} onRemove={() => handleRemove(item.id)} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </SortableContext>
                </DndContext>

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
                      Creating PDF...
                    </>
                  ) : (
                    "Convert to PDF"
                  )}
                </button>
              </>
            )}

            {error && <p className="text-center text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
