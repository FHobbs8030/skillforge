import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import Clock from "../Clock/Clock";

import logo from "../../assets/logo.png";

import "./Header.css";

const hostSectionLinks = [
  {
    id: "project-setup",
    label: "Project Setup",
  },
  {
    id: "section-summary",
    label: "Section Summary",
  },
  {
    id: "team-local-times",
    label: "Team Times",
  },
];

const collaboratorSectionLinks = [
  {
    id: "collaborator-overview",
    label: "Overview",
  },
  {
    id: "work-sections",
    label: "Work Sections",
  },
  {
    id: "communication",
    label: "Communication",
  },
];

const emptySectionLinks = [];

const getPrimaryNavClassName = ({ isActive }) => {
  return `header__nav-link${isActive ? " header__nav-link--active" : ""}`;
};

function Header({
  isWelcomePage = false,
  isDemoMission = false,
  isHostPreview = false,
  isCollaboratorPreview = false,
}) {
  const [activeSection, setActiveSection] = useState("");

  let sectionLinks = emptySectionLinks;

  if (isHostPreview) {
    sectionLinks = hostSectionLinks;
  } else if (isCollaboratorPreview) {
    sectionLinks = collaboratorSectionLinks;
  }

  const activeSectionExists = sectionLinks.some(
    (section) => section.id === activeSection,
  );

  const resolvedActiveSection = activeSectionExists
    ? activeSection
    : (sectionLinks[0]?.id ?? "");

  useEffect(() => {
    if (sectionLinks.length === 0) {
      return undefined;
    }

    const sections = sectionLinks
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    if (sections.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (firstEntry, secondEntry) =>
              firstEntry.boundingClientRect.top -
              secondEntry.boundingClientRect.top,
          );

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-150px 0px -60% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionLinks]);

  const sectionNavigationLabel = isHostPreview
    ? "Host dashboard sections"
    : "Collaborator dashboard sections";

  return (
    <header
      className={`header${
        sectionLinks.length > 0 ? " header--workspace-preview" : ""
      }${isWelcomePage ? " header--welcome" : ""}${
        isDemoMission ? " header--demo" : ""
      }`}
    >
      <div className="header__inner">
        <div className="header__left">
          <Link
            to="/"
            className="header__logo-link"
            aria-label="Return to the SkillForge home page"
            title="Return to Home"
          >
            <img src={logo} alt="SkillForge" className="header__logo" />
          </Link>
        </div>

        {!isWelcomePage && !isDemoMission && (
          <div className="header__clock">
            <Clock />
          </div>
        )}

        <div className="header__right">
          {isWelcomePage ? (
            <nav
              className="header__nav header__nav--public"
              aria-label="Public navigation"
            >
              <a
                className="header__nav-link header__nav-link--welcome-secondary"
                href="#about"
              >
                About
              </a>

              <a
                className="header__nav-link header__nav-link--welcome-secondary"
                href="#how-it-works"
              >
                How It Works
              </a>

              <a
                className="header__nav-link header__nav-link--welcome-secondary"
                href="#memberships"
              >
                Memberships
              </a>

              <Link className="header__nav-link" to="/host-preview">
                Host Demo
              </Link>

              <Link className="header__nav-link" to="/collaborator-preview">
                Collaborator Demo
              </Link>

              <Link
                className="header__nav-link header__nav-link--signin"
                to="/signin"
              >
                Sign In
              </Link>

              <Link
                className="header__nav-link header__nav-link--cta"
                to="/demo"
              >
                Try SkillForge
              </Link>
            </nav>
          ) : isDemoMission ? (
            <nav
              className="header__nav header__nav--demo"
              aria-label="Demo navigation"
            >
              <span className="header__demo-label">Mission Simulation</span>

              <Link className="header__nav-link header__nav-link--cta" to="/">
                Exit Demo
              </Link>
            </nav>
          ) : (
            <nav className="header__nav" aria-label="Primary navigation">
              <NavLink to="/" end className={getPrimaryNavClassName}>
                Home
              </NavLink>

              <NavLink
                to="/host-preview"
                end
                className={getPrimaryNavClassName}
              >
                Host Dashboard
              </NavLink>

              <NavLink
                to="/collaborator-preview"
                end
                className={getPrimaryNavClassName}
              >
                Collaborator
              </NavLink>
            </nav>
          )}
        </div>
      </div>

      {sectionLinks.length > 0 && (
        <nav
          className="header__section-nav"
          aria-label={sectionNavigationLabel}
        >
          <div className="header__section-nav-inner">
            {sectionLinks.map((section) => {
              const isActive = resolvedActiveSection === section.id;

              return (
                <a
                  key={section.id}
                  className={`header__section-link${
                    isActive ? " header__section-link--active" : ""
                  }`}
                  href={`#${section.id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => {
                    event.preventDefault();

                    const targetSection = document.getElementById(section.id);

                    targetSection?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });

                    setActiveSection(section.id);
                  }}
                >
                  {section.label}
                </a>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;
