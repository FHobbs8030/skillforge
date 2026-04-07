import "./GitHubCard.css";

function GitHubCard({ githubUser, setGithubUser, fetchGitHubData, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchGitHubData();
  };

  return (
    <form className="github__card-controls" onSubmit={handleSubmit}>
      <input
        className="github__card-input"
        type="text"
        placeholder="Enter GitHub username"
        value={githubUser}
        onChange={(e) => setGithubUser(e.target.value)}
      />
      <button
        className="button button--primary github__card-button"
        type="submit"
        disabled={loading}
      >
        {loading ? "Loading..." : "Fetch GitHub Data"}
      </button>
    </form>
  );
}

export default GitHubCard;
