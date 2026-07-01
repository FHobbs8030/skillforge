import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { getEntries, addEntry, deleteEntry, getGitHubUser } from "./utils/api";

import Profile from "./pages/Profile";
import HostDashboard from "./pages/HostDashboard/HostDashboard";
import Header from "./components/Header/Header";
import GitHubCard from "./components/GitHubCard/GitHubCard";
import EntryForm from "./components/EntryForm/EntryForm";
import Stats from "./components/Stats/Stats";
import Footer from "./components/Footer/Footer";

import userImage from "./assets/Fred.png";

import "./App.css";

function App() {
    const location = useLocation();

    const isHostPreview = location.pathname === "/host-preview";
  console.log("API URL:", import.meta.env.VITE_API_URL);

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
  const [deletingEntryId, setDeletingEntryId] = useState(null);

  useEffect(() => {
    getEntries().then(setEntries).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.topic || !formData.hours) return;

    addEntry({
      ...formData,
      hours: Number(formData.hours),
    })
      .then((newEntry) => {
        setEntries((currentEntries) => [newEntry, ...currentEntries]);

        setFormData({
          topic: "",
          hours: "",
          notes: "",
          date: "",
        });
      })
      .catch((err) => {
        console.error("ADD ENTRY ERROR:", err);
        alert("Unable to add the learning entry. Please try again.");
      });
  };

  const handleDelete = async (entryId) => {
    if (!entryId) return;

    const shouldDelete = window.confirm(
      "Are you sure you want to delete this learning entry?",
    );

    if (!shouldDelete) return;

    try {
      setDeletingEntryId(entryId);

      await deleteEntry(entryId);

      setEntries((currentEntries) =>
        currentEntries.filter((entry) => entry._id !== entryId),
      );
    } catch (err) {
      console.error("DELETE ENTRY ERROR:", err);
      alert("Unable to delete the learning entry. Please try again.");
    } finally {
      setDeletingEntryId(null);
    }
  };

  const fetchGitHubData = () => {
    console.log("FETCH FUNCTION CALLED");

    if (!githubUser.trim()) return;

    setLoading(true);

    getGitHubUser(githubUser.trim())
      .then((data) => {
        console.log("SUCCESS:", data);
        setGithubData(data);
      })
      .catch((err) => {
        console.error("FETCH ERROR:", err);
        alert("User not found or server error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const totalHours = entries.reduce(
    (sum, entry) => sum + Number(entry.hours),
    0,
  );

  return (
    <div className="app-container">
      <div
        className={`app-layout${
          isHostPreview ? " app-layout--host-preview" : ""
        }`}
      >
        <Header
          githubData={githubData}
          githubUser={githubUser}
          isHostPreview={isHostPreview}
        />

        <main
          className={`main-content${
            isHostPreview ? " main-content--host-preview" : ""
          }`}
        >
          <div
            className={`main-inner${
              isHostPreview ? " main-inner--host-preview" : ""
            }`}
          >
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
                        <p className="dashboard__empty">
                          No entries yet. Add your first learning session.
                        </p>
                      ) : (
                        entries.map((entry) => (
                          <div key={entry._id || entry.topic} className="card">
                            <h3>{entry.topic}</h3>

                            <p>{entry.hours} hrs</p>

                            <span>{entry.notes}</span>

                            <button
                              className="card__delete-button"
                              type="button"
                              onClick={() => handleDelete(entry._id)}
                              disabled={
                                !entry._id || deletingEntryId === entry._id
                              }
                            >
                              {deletingEntryId === entry._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                }
              />

              <Route path="/profile" element={<Profile />} />
              <Route path="/host-preview" element={<HostDashboard />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
