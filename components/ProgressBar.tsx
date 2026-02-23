"use client";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showLabel = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full space-y-1">
      {(showLabel || label) && (
        <div className="flex justify-between text-sm">
          {label && <span className="font-medium text-slate-600">{label}</span>}
          {showLabel && (
            <span className="text-slate-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
