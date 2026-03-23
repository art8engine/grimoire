import { useState, useEffect } from "react";
import { SLASH_COMMANDS } from "../lib/templates";

interface SlashMenuProps {
  query: string;
  onSelect: (commandId: string) => void;
  onClose: () => void;
}

export default function SlashMenu({ query, onSelect, onClose }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

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
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopImmediatePropagation();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopImmediatePropagation();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].id);
        }
      }
    };
    // Use capture phase to intercept before TipTap
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div className="slash-menu">
      {filtered.map((cmd, i) => (
        <div
          key={cmd.id}
          className={`slash-menu-item${i === selectedIndex ? " active" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
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
