import { useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";

function App() {
  const [entries, setEntries] = useState([
    { topic: "React", hours: 2, notes: "Practice" },
    { topic: "React", hours: 2, notes: "Practiced components" },
  ]);

  const [formData, setFormData] = useState({
    topic: "",
    hours: "",
    notes: "",
    date: "",
  });

  const [githubUser, setGithubUser] = useState("");
  const [githubData, setGithubData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.topic || !formData.hours) return;

    setEntries((prev) => [...prev, formData]);

    setFormData({
      topic: "",
      hours: "",
      notes: "",
      date: "",
    });
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
    <div className="dashboard">
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
          <img src={githubData.avatar_url} alt="avatar" className="avatar" />
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
  );
}

export default App;
