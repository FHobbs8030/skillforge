import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "https://your-api-url.com";

function App() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    topic: "",
    hours: "",
    notes: "",
    date: "",
  });

  const [githubUser, setGithubUser] = useState("");
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH ENTRIES (GET)
  // =========================
  useEffect(() => {
    fetch(`${API_BASE}/entries`)
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error(err));
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // ADD ENTRY (POST)
  // =========================
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${API_BASE}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        hours: Number(form.hours),
      }),
    })
      .then((res) => res.json())
      .then((newEntry) => {
        setEntries([newEntry, ...entries]);
        setForm({ topic: "", hours: "", notes: "", date: "" });
      })
      .catch((err) => console.error(err));
  };

  // =========================
  // FETCH GITHUB DATA
  // =========================
  const fetchGithub = () => {
    if (!githubUser) return;

    setLoading(true);

    fetch(`${API_BASE}/github/${githubUser}`)
      .then((res) => res.json())
      .then((data) => {
        setGithubData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  // =========================
  // TOTAL HOURS
  // =========================
  const totalHours = entries.reduce((sum, e) => sum + (e.hours || 0), 0);

  return (
    <div className="app">
      <h1>SkillForge</h1>

      {/* =========================
          GITHUB SECTION
      ========================= */}
      <section className="card">
        <h2>GitHub Tracker</h2>

        <input
          type="text"
          placeholder="Enter GitHub username"
          value={githubUser}
          onChange={(e) => setGithubUser(e.target.value)}
        />
        <button onClick={fetchGithub}>Fetch GitHub Data</button>

        {loading && <p>Loading...</p>}

        {githubData && (
          <div className="github-info">
            <p>
              <strong>User:</strong> {githubData.username}
            </p>
            <p>
              <strong>Followers:</strong> {githubData.followers}
            </p>
            <p>
              <strong>Repositories:</strong> {githubData.public_repos}
            </p>
          </div>
        )}
      </section>

      {/* =========================
          ENTRY FORM
      ========================= */}
      <section className="card">
        <h2>Add Learning Entry</h2>

        <form onSubmit={handleSubmit}>
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
          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
          />

          <button type="submit">Add Entry</button>
        </form>
      </section>

      {/* =========================
          STATS
      ========================= */}
      <section className="card">
        <h2>Total Hours</h2>
        <p>{totalHours} hrs</p>
      </section>

      {/* =========================
          ENTRIES LIST
      ========================= */}
      <section className="card">
        <h2>Entries</h2>

        {entries.length === 0 && <p>No entries yet</p>}

        {entries.map((entry) => (
          <div key={entry._id} className="entry">
            <h3>{entry.topic}</h3>
            <p>{entry.hours} hrs</p>
            <p>{entry.date}</p>
            <p>{entry.notes}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
