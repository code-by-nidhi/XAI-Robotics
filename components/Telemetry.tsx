"use client";

import { useEffect, useState } from "react";

type Row = { k: string; base: number; jitter: number; unit: string; digits: number };

export default function Telemetry({ rows, className = "" }: { rows: Row[]; className?: string }) {
  const [vals, setVals] = useState(() => rows.map((r) => r.base));

  useEffect(() => {
    const id = window.setInterval(() => {
      setVals(rows.map((r) => r.base + (Math.random() - 0.5) * 2 * r.jitter));
    }, 140);
    return () => window.clearInterval(id);
  }, [rows]);

  return (
    <dl className={`telemetry ${className}`}>
      {rows.map((r, i) => (
        <div key={r.k}>
          <dt>{r.k}</dt>
          <dd>
            {vals[i].toFixed(r.digits)}
            <small>{r.unit}</small>
          </dd>
        </div>
      ))}
    </dl>
  );
}
