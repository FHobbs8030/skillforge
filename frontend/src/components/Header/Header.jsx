import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logo.png";
import Clock from "../Clock/Clock";

function Header({ githubData }) {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__left">
          <Link to="/" className="header__logo-link">
            <img src={logo} alt="SkillForge" className="header__logo" />
          </Link>
        </div>

        <div className="header__clock">
          <Clock />
        </div>

        <div className="header__right">
          <nav className="header__nav">
            <Link to="/">Home</Link>
            <Link to="/profile">Profile</Link>
          </nav>

          {githubData?.user && (
            <div className="header__user">
              <img
                src={githubData.user.avatar_url}
                alt="User avatar"
                className="header__avatar"
              />
              <span className="header__username">{githubData.user.login}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
