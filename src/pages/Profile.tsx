import { useEffect, useState, useRef } from "react";
import TopBar from "../components/TopBar";
import { getSetting, setSetting } from "../lib/db";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const n = await getSetting("profile_name");
      const e = await getSetting("profile_email");
      const p = await getSetting("profile_phone");
      const a = await getSetting("profile_avatar");
      if (n) setName(n);
      if (e) setEmail(e);
      if (p) setPhone(p);
      if (a) setAvatar(a);
    })();
  }, []);

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await setSetting("profile_name", name);
    await setSetting("profile_email", email);
    await setSetting("profile_phone", phone);
    if (avatar) await setSetting("profile_avatar", avatar);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <TopBar showBack />
      <div className="profile-page">
        <div className="profile-avatar-wrap" onClick={() => fileRef.current?.click()}>
          <div
            className="profile-avatar-lg"
            style={avatar ? { backgroundImage: `url(${avatar})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          />
          <div className="profile-camera">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarUpload}
        />
        <div className="profile-form">
          <label className="profile-label">이름</label>
          <input
            className="profile-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
          />
          <label className="profile-label">이메일</label>
          <input
            className="profile-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            type="email"
          />
          <label className="profile-label">전화번호</label>
          <input
            className="profile-input"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="010-0000-0000"
            type="tel"
          />
          <button className="profile-save" onClick={handleSave}>
            {saved ? "저장됨" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
