import "./Stats.css";

function Stats({ entries, totalHours }) {
  return (
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
  );
}

export default Stats;
