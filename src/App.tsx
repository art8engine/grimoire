import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";
import EpisodeList from "./pages/EpisodeList";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/work/:id" element={<Dashboard />} />
        <Route path="/work/:id/episodes" element={<EpisodeList />} />
        <Route path="/work/:id/editor/:episodeId" element={<Editor />} />
        <Route path="/work/:id/notes" element={<Notes />} />
        <Route path="/work/:id/notes/:noteId" element={<Notes />} />
      </Routes>
    </BrowserRouter>
  );
}
