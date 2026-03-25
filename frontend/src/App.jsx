import { useState, useEffect } from "react";
import "./App.css";
import logo from "./assets/logo.png";
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
    <div className="app-container">
      <div className="app-layout">
        <aside className="side left">
          {projects.map((project, i) => (
            <div key={i} className="project-card">
              <img src={project.image} alt={project.title} />
              <h4>{project.title}</h4>
              <p>{project.date}</p>
              {project.featured && <span>⭐ Featured</span>}
            </div>
          ))}
        </aside>

        <main className="main-content">
          <div className="main-inner">
            <div className="header">
              <img src={logo} alt="SkillForge Logo" className="logo" />
            </div>

            <div className="github-section">
              <input
                type="text"
                placeholder="Enter GitHub username"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
              />
              <button onClick={fetchGitHubData}>Fetch GitHub Data</button>
            </div>

            {githubData && (
              <div className="github-card">
                <img
                  src={githubData.avatar_url}
                  alt="avatar"
                  className="avatar"
                />
                <h3>{githubData.login}</h3>
                <p>Followers: {githubData.followers}</p>
                <p>Repos: {githubData.public_repos}</p>
              </div>
            )}

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

            <form className="entry-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  name="topic"
                  placeholder="Topic"
                  value={formData.topic}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="hours"
                  placeholder="Hours"
                  value={formData.hours}
                  onChange={handleChange}
                />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="notes"
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="add-btn">
                Add Entry
              </button>
            </form>

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

        <aside className="side right">
          {projects.map((project, i) => (
            <div key={i} className="project-card">
              <img src={project.image} alt={project.title} />
              <h4>{project.title}</h4>
              <p>{project.date}</p>
              {project.featured && <span>⭐ Featured</span>}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

export default App;
