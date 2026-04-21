import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COLORS = [
  "hsl(var(--store-primary))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

interface Piece {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  size: number;
  delay: number;
}

export function ConfettiBurst({ count = 40 }: { count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const newPieces: Piece[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      y: -(Math.random() * 400 + 200),
      rotate: Math.random() * 720 - 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.2,
    }));
    setPieces(newPieces);
    const t = setTimeout(() => setDone(true), 2500);
    return () => clearTimeout(t);
  }, [count]);

  if (done) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center" aria-hidden="true">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rotate, opacity: 0 }}
          transition={{ duration: 2, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
