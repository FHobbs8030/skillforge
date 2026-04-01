import "./Header.css";
import logo from "../../assets/logo.png";
import Clock from "../Clock/Clock";

function Header({ githubData }) {
  return (
    <header className={`header ${githubData?.user ? "header--user" : ""}`}>
      <div className="header__inner">
        <img src={logo} alt="SkillForge logo" className="header__logo" />

        <div className="header__clock">
          <Clock />
        </div>

        <div className="header__right">
          <nav className="header__nav">
            <a href="/">Home</a>
            <a href="/profile">Profile</a>
          </nav>

          {githubData?.user && (
            <>
              <a
                href={`https://github.com/${githubData.user.login}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={githubData.user.avatar_url}
                  alt="User avatar"
                  className="header__avatar"
                />
              </a>

              <span className="header__username">{githubData.user.login}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
