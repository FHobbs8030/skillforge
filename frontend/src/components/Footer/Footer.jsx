import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__text">© {new Date().getFullYear()} Fred Hobbs</p>

        <div className="footer__connect">
          <span className="footer__connect-label">Connect:</span>

          <nav
            className="footer__social-nav"
            aria-label="External profile and contact links"
          >
            <a
              href="https://github.com/FHobbs8030/skillforge"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              GitHub Repo
              <span aria-hidden="true">↗</span>
            </a>

            <a
              href="https://www.linkedin.com/in/fred-hobbs-70aa9417a/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              LinkedIn
              <span aria-hidden="true">↗</span>
            </a>

            <a
              href="https://fhobbs8030.github.io/responsive-portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              Portfolio
              <span aria-hidden="true">↗</span>
            </a>

            <a
              href="https://fhobbs8030.github.io/responsive-portfolio/#contact"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              Contact
              <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
