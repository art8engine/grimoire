import { useEffect, useState, useCallback } from "react";
import { getSetting, setSetting, getWorks, resetAllData } from "../lib/db";
import { TUTORIAL_STEPS } from "../lib/tutorial-steps";

export function useTutorial(dbReady: boolean) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const v = await getSetting("onboarding_completed");
      if (v === "true") {
        setLoaded(true);
        return;
      }
      const works = await getWorks();
      if (works.length > 0) {
        await setSetting("onboarding_completed", "true");
        setLoaded(true);
        return;
      }
      setIsActive(true);
      setLoaded(true);
    })();
  }, [dbReady]);

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
    await resetAllData();
    window.location.href = "/";
  }, []);

  return { stepIndex, isActive, currentStep, next, skip, complete, reset, loaded };
}
