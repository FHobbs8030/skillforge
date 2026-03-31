import "./GitHubCard.css";

function GitHubCard({ githubUser, setGithubUser, fetchGitHubData, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchGitHubData();
  };

  return (
    <form className="github-card__controls" onSubmit={handleSubmit}>
      <input
        className="github-card__input"
        type="text"
        placeholder="Enter GitHub username"
        value={githubUser}
        onChange={(e) => setGithubUser(e.target.value)}
      />
      <button
        className="button button--primary github-card__button"
        type="submit"
        disabled={loading}
      >
        {loading ? "Loading..." : "Fetch GitHub Data"}
      </button>
    </form>
  );
}

export default GitHubCard;
