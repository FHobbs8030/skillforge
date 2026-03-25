import { Routes, Route, Link } from "react-router-dom";
import Profile from "./pages/Profile";
import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import GitHubCard from "./components/GitHubCard/GitHubCard";
import EntryForm from "./components/EntryForm/EntryForm";
import Sidebar from "./components/Sidebar/Sidebar";
import appImage from "./assets/app.png";
import trelloImage from "./assets/trello.png";

function App() {
  const API_URL = "http://localhost:3001";

  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    topic: "",
    hours: "",
    notes: "",
    date: "",
  });

  const [githubUser, setGithubUser] = useState("");
  const [githubData, setGithubData] = useState(null);

  const projects = [
    {
      title: "SkillForge",
      image: appImage,
      date: "2026-03-23",
      featured: true,
    },
    { title: "WTWR", image: trelloImage, date: "2026-02-01", featured: false },
    {
      title: "Portfolio",
      image: appImage,
      date: "2026-01-10",
      featured: false,
    },
  ];

  useEffect(() => {
    fetch(`${API_URL}/entries`)
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.topic || !formData.hours) return;

    try {
      const res = await fetch(`${API_URL}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          hours: Number(formData.hours),
        }),
      });

      const newEntry = await res.json();

      setEntries((prev) => [newEntry, ...prev]);

      setFormData({
        topic: "",
        hours: "",
        notes: "",
        date: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const totalHours = entries.reduce(
    (sum, entry) => sum + Number(entry.hours),
    0,
  );

  const fetchGitHubData = async () => {
    if (!githubUser) return;

    try {
      const res = await fetch(`https://api.github.com/users/${githubUser}`);
      const data = await res.json();

      if (data.message === "Not Found") {
        alert("User not found");
        return;
      }

      setGithubData(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
  <Routes>
    <Route
      path="/"
      element={
        <div className="app-container">
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/profile">Profile</Link>
          </nav>

          <div className="app-layout">
            <Sidebar projects={projects} position="left" />

            <main className="main-content">
              <div className="main-inner">
                <Header />

                <GitHubCard
                  githubUser={githubUser}
                  setGithubUser={setGithubUser}
                  fetchGitHubData={fetchGitHubData}
                  githubData={githubData}
                />

                <div className="stats">
                  <div className="stat-card">
                    <h3>{entries.length}</h3>
                    <p>Entries</p>
                  </div>
                  <div className="stat-card">
                    <h3>{totalHours}</h3>
                    <p>Total Hours</p>
                  </div>
                </div>

                <EntryForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                />

                <div className="grid">
                  {entries.map((entry, index) => (
                    <div key={index} className="card">
                      <h3>{entry.topic}</h3>
                      <p>{entry.hours} hrs</p>
                      <span>{entry.notes}</span>
                    </div>
                  ))}
                </div>
              </div>
            </main>

            <Sidebar projects={projects} position="right" />
          </div>
        </div>
      }
    />

    <Route path="/profile" element={<Profile />} />
  </Routes>
);
}

export default App;
