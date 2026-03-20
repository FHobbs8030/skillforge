import { useEffect, useState } from "react";

function App() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>SkillForge Entries</h1>

      {entries.length === 0 ? (
        <p>No entries found</p>
      ) : (
        entries.map((entry) => (
          <div key={entry._id} style={{ marginBottom: "20px" }}>
            <h3>{entry.topic}</h3>
            <p>Hours: {entry.hours}</p>
            <p>{entry.notes}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
