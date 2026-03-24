import { useState, useEffect, useCallback, useRef } from "react";
import TutorialSpotlight from "./TutorialSpotlight";
import { setSetting } from "../lib/db";
import { resizeAndEncode } from "../lib/image-upload";
import type { TutorialStep } from "../lib/tutorial-steps";

interface TutorialProps {
  step: TutorialStep | null;
  onNext: () => void;
  onSkip: () => void;
}

export default function Tutorial({ step, onNext, onSkip }: TutorialProps) {
  if (!step) return null;

  switch (step.type) {
    case "welcome":
      return <WelcomePage step={step} onNext={onNext} onSkip={onSkip} />;
    case "profile":
      return <ProfilePage step={step} onNext={onNext} onSkip={onSkip} />;
    case "spotlight":
      return (
        <TutorialSpotlight
          target={step.target ?? ""}
          title={step.title}
          text={step.text}
          position={step.position}
          waitForClick={step.waitForClick}
          onNext={onNext}
          onSkip={onSkip}
        />
      );
    case "info":
      return <InfoPage step={step} onNext={onNext} onSkip={onSkip} />;
    case "complete":
      return <CompletePage step={step} onNext={onNext} />;
    default:
      return null;
  }
}

function WelcomePage({
  step,
  onNext,
  onSkip,
}: {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="tutorial-fullpage">
      <div className="tutorial-fullpage-content">
        <div className="tutorial-logo">GRIMOIRE</div>
        <div className="tutorial-fullpage-title">{step.title}</div>
        <div className="tutorial-fullpage-text">{step.text}</div>
        <button className="tutorial-btn-primary" onClick={onNext}>
          시작하기
        </button>
        <button className="tutorial-btn-skip" onClick={onSkip}>
          건너뛰기
        </button>
      </div>
    </div>
  );
}

function ProfilePage({
  step,
  onNext,
  onSkip,
}: {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const encoded = await resizeAndEncode(file);
      setAvatar(encoded);
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (name.trim()) await setSetting("profile_name", name.trim());
    if (email.trim()) await setSetting("profile_email", email.trim());
    if (phone.trim()) await setSetting("profile_phone", phone.trim());
    if (avatar) await setSetting("profile_avatar", avatar);
    onNext();
  }, [name, email, phone, avatar, onNext]);

  return (
    <div className="tutorial-fullpage">
      <div className="tutorial-fullpage-content">
        <div className="tutorial-fullpage-title">{step.title}</div>
        <div className="tutorial-fullpage-text">{step.text}</div>
        <div className="tutorial-profile-section">
          <div
            className="tutorial-avatar-upload"
            onClick={() => fileRef.current?.click()}
            style={
              avatar
                ? { backgroundImage: `url(${avatar})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            {!avatar && <span className="tutorial-avatar-placeholder">+</span>}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <div className="tutorial-form-fields">
            <input
              className="tutorial-input"
              type="text"
              placeholder="필명"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <input
              className="tutorial-input"
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="tutorial-input"
              type="tel"
              placeholder="전화번호"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
          </div>
        </div>
        <button className="tutorial-btn-primary" onClick={handleSubmit}>
          다음
        </button>
        <button className="tutorial-btn-skip" onClick={onSkip}>
          건너뛰기
        </button>
      </div>
    </div>
  );
}

function InfoPage({
  step,
  onNext,
  onSkip,
}: {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
}) {
  useEffect(() => {
    if (!step.waitForKey) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === step.waitForKey) onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step.waitForKey, onNext]);

  return (
    <div className="tutorial-fullpage">
      <div className="tutorial-fullpage-content">
        <div className="tutorial-fullpage-title">{step.title}</div>
        <div className="tutorial-fullpage-text">{step.text}</div>
        <button className="tutorial-btn-primary" onClick={onNext}>
          다음
        </button>
        <button className="tutorial-btn-skip" onClick={onSkip}>
          건너뛰기
        </button>
      </div>
    </div>
  );
}

function CompletePage({
  step,
  onNext,
}: {
  step: TutorialStep;
  onNext: () => void;
}) {
  return (
    <div className="tutorial-fullpage">
      <div className="tutorial-fullpage-content">
        <div className="tutorial-complete-check">&#10003;</div>
        <div className="tutorial-fullpage-title">{step.title}</div>
        <div className="tutorial-fullpage-text">{step.text}</div>
        <button className="tutorial-btn-primary" onClick={onNext}>
          시작하기
        </button>
      </div>
    </div>
  );
}
