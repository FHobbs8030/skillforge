import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/logo.png";

function Header() {
  return (
    <div className="header">
      <div className="header__inner">
        <img src={logo} alt="SkillForge Logo" className="logo" />

        <nav className="header__nav">
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </div>
    </div>
  );
}

export default Header;