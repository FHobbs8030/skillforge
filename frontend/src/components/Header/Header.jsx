import "./Header.css";
import logo from "../../assets/logo.png";

function Header() {
  return (
    <div className="header">
      <img src={logo} alt="SkillForge Logo" className="logo" />
    </div>
  );
}

export default Header;
