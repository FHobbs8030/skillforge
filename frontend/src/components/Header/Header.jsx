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
  githubData,
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

        <div className="header__clock">
          <Clock />
        </div>

        <div className="header__right">
          <nav className="header__nav" aria-label="Primary navigation">
            <NavLink to="/" end className={getPrimaryNavClassName}>
              Home
            </NavLink>

            <NavLink to="/host-preview" end className={getPrimaryNavClassName}>
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

          {githubData?.user && (
            <div className="header__user">
              <img
                src={githubData.user.avatar_url}
                alt={`${githubData.user.login} avatar`}
                className="header__avatar"
              />

              <span className="header__username">{githubData.user.login}</span>
            </div>
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
                  onClick={() => setActiveSection(section.id)}
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
