import { useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";

function App() {
  const [entries, setEntries] = useState(() => {
    return JSON.parse(localStorage.getItem("entries")) || [];
  });
  const [form, setForm] = useState({
    topic: "",
    hours: "",
    notes: "",
    date: "",
  });

  const [githubUser, setGithubUser] = useState("");
  const [githubData, setGithubData] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEntry = {
      ...form,
      hours: Number(form.hours),
      _id: Date.now(),
    };

    const updated = [newEntry, ...entries];

    setEntries(updated);
    localStorage.setItem("entries", JSON.stringify(updated));

    setForm({ topic: "", hours: "", notes: "", date: "" });
  };

  const fetchGithub = () => {
    if (!githubUser) return;

    fetch(`https://api.github.com/users/${githubUser}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.login) {
          setGithubData(null);
          return;
        }

        setGithubData({
          username: data.login,
          followers: data.followers,
          public_repos: data.public_repos,
        });
      })
      .catch(() => {});
  };

  const totalHours = entries.reduce((sum, e) => sum + (e.hours || 0), 0);

  return (
    <div className="dashboard">
      <div className="header">
        <img src={logo} alt="SkillForge Logo" className="logo" />
      </div>

      {/* STATS */}
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

      {/* GITHUB */}
      <div className="entry-form">
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={githubUser}
          onChange={(e) => setGithubUser(e.target.value)}
        />
        <button onClick={fetchGithub}>Fetch GitHub Data</button>
      </div>

      {githubData && (
        <div className="card">
          <h3>{githubData.username}</h3>
          <p>{githubData.followers} followers</p>
          <p>{githubData.public_repos} repos</p>
        </div>
      )}

      {/* FORM */}
      <form className="entry-form" onSubmit={handleSubmit}>
        <input
          name="topic"
          placeholder="Topic"
          value={form.topic}
          onChange={handleChange}
          required
        />
        <input
          name="hours"
          type="number"
          placeholder="Hours"
          value={form.hours}
          onChange={handleChange}
          required
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
        />

        <button type="submit">Add Entry</button>
      </form>

      {/* ENTRIES */}
      <div className="grid">
        {entries.map((entry) => (
          <div key={entry._id} className="card">
            <h3>{entry.topic}</h3>
            <p>{entry.hours} hrs</p>
            <span>{entry.notes}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
