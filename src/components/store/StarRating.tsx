interface StarRatingProps {
  rating: number;
  count: number;
  compact?: boolean;
}

export default function StarRating({ rating, count, compact = false }: StarRatingProps) {
  const filled = Math.round(rating);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < filled ? "#FACC15" : "#E5E7EB"}>
            <polygon points="12 2 15 9 22 9.3 16.5 14 18 21 12 17.3 6 21 7.5 14 2 9.3 9 9" />
          </svg>
        ))}
      </div>
      {!compact && (
        <span style={{ fontSize: 13, color: "var(--rut-fg-600)", fontWeight: 500 }}>
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}
