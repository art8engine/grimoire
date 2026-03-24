import { useEffect, useState, useCallback } from "react";
import { getSetting, setSetting, getWorks, resetAllData } from "../lib/db";
import { TUTORIAL_STEPS } from "../lib/tutorial-steps";

export function useTutorial() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await getSetting("onboarding_completed");
      if (v === "true") {
        // 온보딩 완료 → 스킵
        setLoaded(true);
        return;
      }
      // 온보딩 미완료 → 기존 데이터 확인
      const works = await getWorks();
      if (works.length > 0) {
        // 기존 데이터 존재 → 튜토리얼 스킵, 완료 처리
        await setSetting("onboarding_completed", "true");
        setLoaded(true);
        return;
      }
      // 데이터 없음 → 튜토리얼 시작
      setIsActive(true);
      setLoaded(true);
    })();
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
    await resetAllData();
    window.location.href = "/";
  }, []);

  return { stepIndex, isActive, currentStep, next, skip, complete, reset, loaded };
}
