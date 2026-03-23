import { useState, useEffect, useRef } from "react";
import { SLASH_COMMANDS } from "../lib/templates";

interface SlashMenuProps {
  query: string;
  position: { top: number; left: number };
  onSelect: (commandId: string) => void;
  onClose: () => void;
}

export default function SlashMenu({ query, position, onSelect, onClose }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = SLASH_COMMANDS.filter(
    (c) => c.id.includes(query.toLowerCase()) || c.label.includes(query)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].id);
        }
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div className="slash-menu" ref={ref} style={{ top: position.top, left: position.left }}>
      {filtered.map((cmd, i) => (
        <div
          key={cmd.id}
          className={`slash-menu-item${i === selectedIndex ? " active" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(cmd.id);
          }}
          onMouseEnter={() => setSelectedIndex(i)}
        >
          <div className="slash-menu-label">{cmd.label}</div>
          <div className="slash-menu-desc">{cmd.description}</div>
        </div>
      ))}
    </div>
  );
}
