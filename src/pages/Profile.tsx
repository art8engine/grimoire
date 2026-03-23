import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { getSetting, setSetting } from "../lib/db";

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const n = await getSetting("profile_name");
      const e = await getSetting("profile_email");
      const p = await getSetting("profile_phone");
      if (n) setName(n);
      if (e) setEmail(e);
      if (p) setPhone(p);
    })();
  }, []);

  const handleSave = async () => {
    await setSetting("profile_name", name);
    await setSetting("profile_email", email);
    await setSetting("profile_phone", phone);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <TopBar showBack />
      <div className="profile-page">
        <div className="profile-avatar-lg" />
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
            onChange={(e) => setPhone(e.target.value)}
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
