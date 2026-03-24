import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";
import EpisodeList from "./pages/EpisodeList";
import Tutorial from "./components/Tutorial";
import { useTutorial } from "./hooks/useTutorial";
import { initDb, getSetting, setSetting } from "./lib/db";

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dark, setDark] = useState(false);
  const tutorial = useTutorial(dbReady);

  useEffect(() => {
    initDb().then(() => {
      setDbReady(true);
      return getSetting("dark_mode");
    }).then((v) => {
      if (v === "true") {
        setDark(true);
        document.documentElement.classList.add("dark");
      }
    }).catch((err) => console.error("DB init failed:", err));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        setDark((prev) => {
          const next = !prev;
          if (next) document.documentElement.classList.add("dark");
          else document.documentElement.classList.remove("dark");
          setSetting("dark_mode", String(next));
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!dbReady) {
    return (
      <div className="splash">
        <span className="splash-logo">GRIMOIRE</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home dark={dark} onToggleDark={() => {
          const next = !dark;
          setDark(next);
          if (next) document.documentElement.classList.add("dark");
          else document.documentElement.classList.remove("dark");
          setSetting("dark_mode", String(next));
        }} tutorialReset={tutorial.reset} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/work/:id" element={<Dashboard />} />
        <Route path="/work/:id/episodes" element={<EpisodeList />} />
        <Route path="/work/:id/editor/:episodeId" element={<Editor />} />
        <Route path="/work/:id/notes" element={<Notes />} />
        <Route path="/work/:id/notes/:noteId" element={<Notes />} />
      </Routes>
      {tutorial.isActive && (
        <Tutorial
          step={tutorial.currentStep}
          onNext={tutorial.next}
          onSkip={tutorial.skip}
        />
      )}
    </BrowserRouter>
  );
}
