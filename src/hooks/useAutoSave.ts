import { useEffect, useRef } from "react";

export function useAutoSave(
  content: string,
  save: (content: string) => Promise<void>,
  delay = 2000
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(content);

  useEffect(() => {
    if (content === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      await save(content);
      lastSavedRef.current = content;
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, save, delay]);
}
