import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSetting } from "../lib/db";

export default function Splash() {
  const navigate = useNavigate();
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);

  useEffect(() => {
    getSetting("onboarding_completed").then((v) => {
      if (v === "true") {
        // 기존 사용자: 1초 스플래시 후 홈으로
        setIsFirstVisit(false);
        setTimeout(() => navigate("/home", { replace: true }), 1000);
      } else {
        // 최초 접속: 인트로 페이지
        setIsFirstVisit(true);
      }
    });
  }, [navigate]);

  if (isFirstVisit === null) {
    // DB 로딩 중
    return (
      <div className="splash">
        <span className="splash-logo">GRIMOIRE</span>
      </div>
    );
  }

  if (!isFirstVisit) {
    return (
      <div className="splash">
        <span className="splash-logo">GRIMOIRE</span>
        <span className="splash-sub">A Simple Write Novels App</span>
      </div>
    );
  }

  // 최초 접속 인트로
  return (
    <div className="splash intro-page">
      <span className="splash-logo">GRIMOIRE</span>
      <span className="splash-sub">A Simple Write Novels App</span>
      <button
        className="intro-start-btn"
        onClick={() => navigate("/home", { replace: true })}
      >
        시작하기
      </button>
    </div>
  );
}
