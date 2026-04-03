import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__text">© {new Date().getFullYear()} Fred Hobbs</p>
        <a
          href="https://github.com/FHobbs8030"
          target="_blank"
          rel="noopener noreferrer"
          className="footer__link"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;
