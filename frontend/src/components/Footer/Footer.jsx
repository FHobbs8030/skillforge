import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__copyright">
          © {currentYear}{" "}
          <span className="footer__brand">SkillForge</span>.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
