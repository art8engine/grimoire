import { useEffect, useState, useCallback } from "react";

interface TutorialSpotlightProps {
  target: string;
  text: string;
  title: string;
  position?: "top" | "bottom" | "left" | "right";
  waitForClick?: boolean;
  onNext: () => void;
  onSkip: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TutorialSpotlight({
  target,
  text,
  title,
  position = "bottom",
  waitForClick,
  onNext,
  onSkip,
}: TutorialSpotlightProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const el = document.querySelector(target);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    });
  }, [target]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const interval = setInterval(measure, 300);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      clearInterval(interval);
    };
  }, [measure]);

  useEffect(() => {
    if (!waitForClick) return;

    const handler = (e: MouseEvent) => {
      const el = document.querySelector(target);
      if (el && el.contains(e.target as Node)) {
        onNext();
      }
    };

    // Use capture phase so we detect the click before the overlay might block it
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [waitForClick, target, onNext]);

  if (!rect) {
    return (
      <div className="tutorial-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-card">
          <div className="tutorial-card-title">{title}</div>
          <div className="tutorial-card-text">{text}</div>
          <div className="tutorial-card-actions">
            {!waitForClick && (
              <button className="tutorial-btn-next" onClick={onNext}>
                다음
              </button>
            )}
            <button className="tutorial-btn-skip" onClick={onSkip}>
              건너뛰기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const padding = 8;
  const cutout = {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };

  const bubbleStyle = computeBubblePosition(cutout, position);

  return (
    <>
      <div
        className="tutorial-overlay tutorial-spotlight-overlay"
        style={{
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.55)`,
          top: cutout.top,
          left: cutout.left,
          width: cutout.width,
          height: cutout.height,
          borderRadius: 8,
          position: "fixed",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
      {/* Clickable area over the target so user can interact */}
      <div
        className="tutorial-spotlight-target"
        style={{
          position: "fixed",
          top: cutout.top,
          left: cutout.left,
          width: cutout.width,
          height: cutout.height,
          zIndex: 10000,
          borderRadius: 8,
          pointerEvents: waitForClick ? "auto" : "none",
          cursor: waitForClick ? "pointer" : "default",
        }}
        onClick={() => {
          if (waitForClick) {
            const el = document.querySelector(target) as HTMLElement;
            if (el) el.click();
            onNext();
          }
        }}
      />
      {/* Pulse border around target */}
      <div
        className="tutorial-pulse-ring"
        style={{
          position: "fixed",
          top: cutout.top - 2,
          left: cutout.left - 2,
          width: cutout.width + 4,
          height: cutout.height + 4,
          borderRadius: 10,
          zIndex: 10000,
          pointerEvents: "none",
        }}
      />
      {/* Block clicks on the rest of the page */}
      <div
        className="tutorial-click-blocker"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {/* Speech bubble */}
      <div
        className={`tutorial-bubble tutorial-bubble-${position}`}
        style={{
          ...bubbleStyle,
          position: "fixed",
          zIndex: 10001,
        }}
      >
        <div className="tutorial-bubble-title">{title}</div>
        <div className="tutorial-bubble-text">{text}</div>
        <div className="tutorial-bubble-actions">
          {waitForClick ? (
            <span className="tutorial-click-hint">여기를 클릭하세요</span>
          ) : (
            <button className="tutorial-btn-next" onClick={onNext}>
              다음
            </button>
          )}
          <button className="tutorial-btn-skip" onClick={onSkip}>
            건너뛰기
          </button>
        </div>
      </div>
    </>
  );
}

function computeBubblePosition(
  cutout: { top: number; left: number; width: number; height: number },
  position: "top" | "bottom" | "left" | "right"
): React.CSSProperties {
  const gap = 16;
  switch (position) {
    case "top":
      return {
        bottom: window.innerHeight - cutout.top + gap,
        left: cutout.left + cutout.width / 2,
        transform: "translateX(-50%)",
      };
    case "bottom":
      return {
        top: cutout.top + cutout.height + gap,
        left: cutout.left + cutout.width / 2,
        transform: "translateX(-50%)",
      };
    case "left":
      return {
        top: cutout.top + cutout.height / 2,
        right: window.innerWidth - cutout.left + gap,
        transform: "translateY(-50%)",
      };
    case "right":
      return {
        top: cutout.top + cutout.height / 2,
        left: cutout.left + cutout.width + gap,
        transform: "translateY(-50%)",
      };
  }
}
