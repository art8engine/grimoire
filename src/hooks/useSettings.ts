import { useEffect, useState, useCallback } from "react";
import { getSetting, setSetting } from "../lib/db";

export function useSettings() {
  const [showToolbar, setShowToolbar] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const tb = await getSetting("show_toolbar");
      if (tb !== null) setShowToolbar(tb === "true");
      const fs = await getSetting("font_size");
      if (fs !== null) setFontSize(parseInt(fs, 10));
      setLoaded(true);
    })();
  }, []);

  const updateShowToolbar = useCallback(async (v: boolean) => {
    setShowToolbar(v);
    await setSetting("show_toolbar", String(v));
  }, []);

  const updateFontSize = useCallback(async (v: number) => {
    const clamped = Math.min(28, Math.max(12, v));
    setFontSize(clamped);
    await setSetting("font_size", String(clamped));
  }, []);

  return { showToolbar, fontSize, updateShowToolbar, updateFontSize, loaded };
}
