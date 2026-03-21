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
  });

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
    });
  };

  const totalHours = entries.reduce(
    (sum, entry) => sum + Number(entry.hours),
    0,
  );

  return (
    <div className="dashboard">
      <div className="header">
        <img src={logo} alt="SkillForge Logo" className="logo" />
      </div>

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
          type="text"
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
        />
        <button type="submit">Add Entry</button>
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
