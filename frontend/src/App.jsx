import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import GitHubCard from "./components/GitHubCard/GitHubCard";
import EntryForm from "./components/EntryForm/EntryForm";
import Stats from "./components/Stats/Stats";
import userImage from "./assets/Fred.png";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const currentUser = {
    username: "FHobbs8030",
    image: userImage,
  };

  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    topic: "",
    hours: "",
    notes: "",
    date: "",
  });

  const [githubUser, setGithubUser] = useState("");
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/github/${githubUser}`);

      if (!res.ok) {
        alert("User not found");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setGithubData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="app-layout">
        <Header githubData={githubData} githubUser={githubUser} />

        <main className="main-content">
          <div className="main-inner">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="dashboard-grid">
                    <div className="dashboard-top">
                      <GitHubCard
                        githubUser={githubUser}
                        setGithubUser={setGithubUser}
                        fetchGitHubData={fetchGitHubData}
                        githubData={githubData}
                        loading={loading}
                        currentUser={currentUser}
                      />

                      <Stats entries={entries} totalHours={totalHours} />
                    </div>

                    <EntryForm
                      formData={formData}
                      handleChange={handleChange}
                      handleSubmit={handleSubmit}
                    />

                    <div className="grid">
                      {entries.length === 0 ? (
                        <p style={{ textAlign: "center", opacity: 0.6 }}>
                          No entries yet. Add your first learning session.
                        </p>
                      ) : (
                        entries.map((entry) => (
                          <div key={entry._id || entry.topic} className="card">
                            <h3>{entry.topic}</h3>
                            <p>{entry.hours} hrs</p>
                            <span>{entry.notes}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                }
              />

              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
