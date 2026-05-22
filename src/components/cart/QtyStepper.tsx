"use client";

interface QtyStepperProps {
  value: number;
  onChange: (v: number) => void;
  compact?: boolean;
}

export default function QtyStepper({ value, onChange, compact = false }: QtyStepperProps) {
  const size = compact ? 26 : 38;
  const fontSize = compact ? 13 : 15;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      border: "1px solid var(--rut-border-strong)", borderRadius: 999, overflow: "hidden",
    }}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease quantity"
        style={{
          width: size, height: size, background: "transparent", border: 0,
          cursor: "pointer", color: "var(--rut-fg-700)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span style={{ minWidth: compact ? 20 : 32, textAlign: "center", fontWeight: 700, fontSize }}>{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
        style={{
          width: size, height: size, background: "transparent", border: 0,
          cursor: "pointer", color: "var(--rut-fg-700)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
