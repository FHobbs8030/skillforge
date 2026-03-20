import { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState("");

  const fetchGitHubUser = async () => {
    if (!username) return;

    try {
      setError("");

      const userRes = await fetch(`https://api.github.com/users/${username}`);
      if (!userRes.ok) throw new Error("User not found");

      const userData = await userRes.json();
      setUserData(userData);

      const repoRes = await fetch(userData.repos_url);
      const repoData = await repoRes.json();

      setRepos(repoData.slice(0, 5));
    } catch (err) {
      setError(err.message);
      setUserData(null);
      setRepos([]);
    }
  };

  return (
    <div className="container">
      <h1>🚀 SkillForge</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter GitHub username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={fetchGitHubUser}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {userData && (
        <div className="card">
          <img src={userData.avatar_url} alt="avatar" />
          <h2>{userData.name || userData.login}</h2>
          <p>Followers: {userData.followers}</p>
          <p>Public Repos: {userData.public_repos}</p>
          <a href={userData.html_url} target="_blank">
            View Profile
          </a>
        </div>
      )}

      {/* ✅ MOVE THIS BLOCK HERE */}
      {repos.length > 0 && (
        <div className="repo-list">
          <h3>Top Repositories</h3>
          {repos.map((repo) => (
            <div key={repo.id} className="repo">
              <a href={repo.html_url} target="_blank">
                {repo.name}
              </a>
              <p>⭐ {repo.stargazers_count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
