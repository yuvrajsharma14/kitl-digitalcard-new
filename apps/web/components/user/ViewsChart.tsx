"use client";

import { useState } from "react";

export interface DayData { date: string; count: number }

export function ViewsChart({ data }: { data: DayData[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const max   = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);

  // Label at 4 evenly-spaced positions
  const labelIndices = [0, 9, 19, 29].filter((i) => i < data.length);

  function fmt(dateStr: string) {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en", {
      month: "short", day: "numeric",
    });
  }

  return (
    <div className="space-y-1">
      {/* Bar chart */}
      <div className="flex items-end gap-px h-28">
        {data.map((d, i) => {
          const pct    = Math.max((d.count / max) * 100, d.count > 0 ? 3 : 0);
          const active = hovered === i;
          return (
            <div
              key={d.date}
              className="relative flex-1 flex flex-col items-center justify-end group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {active && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-xl pointer-events-none">
                  <p className="font-semibold">{d.count} view{d.count !== 1 ? "s" : ""}</p>
                  <p className="opacity-60 text-[10px]">{fmt(d.date)}</p>
                  {/* Arrow */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              )}

              {/* Bar */}
              <div
                className="w-full rounded-t-sm transition-all duration-100"
                style={{
                  height:          pct > 0 ? `${pct}%` : "2px",
                  minHeight:       pct > 0 ? "3px" : "2px",
                  backgroundColor: active
                    ? "#4f46e5"
                    : d.count > 0
                    ? "#6366f1"
                    : "#e5e7eb",
                  opacity: active ? 1 : 0.85,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis date labels */}
      <div className="relative h-4">
        {labelIndices.map((idx) => (
          <span
            key={idx}
            className="absolute text-[9px] text-gray-400 -translate-x-1/2"
            style={{ left: `${(idx / (data.length - 1)) * 100}%` }}
          >
            {fmt(data[idx].date)}
          </span>
        ))}
      </div>

      {/* Summary below chart */}
      <p className="text-xs text-gray-400 pt-1">
        <span className="font-semibold text-gray-600">{total.toLocaleString()}</span> total views in the last 30 days
      </p>
    </div>
  );
}
