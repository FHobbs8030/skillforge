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
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.logo}>🚀 SkillForge</h1>
      </header>

      <main style={styles.container}>
        <h2 style={styles.title}>Your Learning Entries</h2>

        {entries.length === 0 ? (
          <p style={styles.empty}>No entries found</p>
        ) : (
          <div style={styles.list}>
            {entries.map((entry) => (
              <div key={entry._id} style={styles.card}>
                <h3>{entry.topic}</h3>
                <p>
                  <strong>Hours:</strong> {entry.hours}
                </p>
                <p>{entry.notes}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    color: "#fff",
  },
  header: {
    padding: "20px",
    borderBottom: "1px solid #1e293b",
    textAlign: "center",
  },
  logo: {
    margin: 0,
    color: "#38bdf8",
  },
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "0 20px",
  },
  title: {
    marginBottom: "20px",
  },
  empty: {
    opacity: 0.7,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "15px",
    borderRadius: "8px",
  },
};

export default App;
