import "./GitHubCard.css";

function GitHubCard({ githubUser, setGithubUser, fetchGitHubData, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchGitHubData();
  };

  return (
    <form className="github-section" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter GitHub username"
        value={githubUser}
        onChange={(e) => setGithubUser(e.target.value)}
      />
      <button className="primary-btn" type="submit" disabled={loading}>
        {loading ? "Loading..." : "Fetch GitHub Data"}
      </button>
    </form>
  );
}

export default GitHubCard;
