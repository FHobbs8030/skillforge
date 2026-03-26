import "./GitHubCard.css";

function GitHubCard({
  githubUser,
  setGithubUser,
  fetchGitHubData,
  githubData,
  loading,
}) {
  return (
    <>
      <>
        <div className="github-section">
          <input
            type="text"
            placeholder="Enter GitHub username"
            value={githubUser}
            onChange={(e) => setGithubUser(e.target.value)}
          />
          <button
            className="primary-btn"
            onClick={fetchGitHubData}
            disabled={loading}
          >
            {loading ? "Loading..." : "Fetch GitHub Data"}
          </button>
        </div>

        <div className="github-wrapper">
          {githubData && (
            <div className="github-card">
              <img
                src={githubData.avatar_url}
                alt="avatar"
                className="avatar"
              />
              <h3>{githubData.login}</h3>
              <p>Followers: {githubData.followers}</p>
              <p>Repos: {githubData.public_repos}</p>
            </div>
          )}
        </div>
      </>
    </>
  );
}

export default GitHubCard;
