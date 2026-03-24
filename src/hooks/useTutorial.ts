import { useEffect, useState, useCallback } from "react";
import { getSetting, setSetting } from "../lib/db";
import { TUTORIAL_STEPS } from "../lib/tutorial-steps";

export function useTutorial() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSetting("onboarding_completed").then((v) => {
      if (v === null) {
        setIsActive(true);
      }
      setLoaded(true);
    });
  }, []);

  const currentStep = isActive ? TUTORIAL_STEPS[stepIndex] ?? null : null;

  const next = useCallback(() => {
    setStepIndex((prev) => {
      const nextIdx = prev + 1;
      if (nextIdx >= TUTORIAL_STEPS.length) {
        setIsActive(false);
        setSetting("onboarding_completed", "true");
        return prev;
      }
      return nextIdx;
    });
  }, []);

  const skip = useCallback(() => {
    setIsActive(false);
    setSetting("onboarding_completed", "true");
  }, []);

  const complete = useCallback(() => {
    setIsActive(false);
    setSetting("onboarding_completed", "true");
  }, []);

  const reset = useCallback(async () => {
    const { resetAllData } = await import("../lib/db");
    await resetAllData();
    window.location.href = "/home";
  }, []);

  return { stepIndex, isActive, currentStep, next, skip, complete, reset, loaded };
}
