import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import Clock from "../Clock/Clock";

import useAuth from "../../contexts/useAuth";

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

function getUserDisplayName(user) {
  if (!user) {
    return "SkillForge Member";
  }

  const combinedName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    user.fullName ||
    user.name ||
    combinedName ||
    user.username ||
    user.email ||
    "SkillForge Member"
  );
}

function getUserInitials(user) {
  const displayName = getUserDisplayName(user);

  if (displayName.includes("@")) {
    return displayName.charAt(0).toUpperCase();
  }

  const nameParts = displayName.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length === 0) {
    return "SF";
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0]}${
    nameParts[nameParts.length - 1][0]
  }`.toUpperCase();
}

function getUserAvatarUrl(user) {
  if (!user) {
    return "";
  }

  return (
    user.avatarUrl ||
    user.avatarURL ||
    user.avatar_url ||
    user.profileImage ||
    user.profileImageUrl ||
    user.image ||
    user.photoUrl ||
    user.githubAvatarUrl ||
    ""
  );
}

function AuthenticatedAccount({ currentUser, onSignOut }) {
  const displayName = getUserDisplayName(currentUser);
  const initials = getUserInitials(currentUser);
  const avatarUrl = getUserAvatarUrl(currentUser);

  return (
    <div className="header__account">
      <div className="header__user" title={currentUser?.email || displayName}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${displayName} avatar`}
            className="header__avatar"
          />
        ) : (
          <span
            className="header__avatar header__avatar--fallback"
            aria-hidden="true"
          >
            {initials}
          </span>
        )}

        <span className="header__username">{displayName}</span>
      </div>

      <button
        className="header__nav-link header__nav-link--signout"
        type="button"
        onClick={onSignOut}
      >
        Sign Out
      </button>
    </div>
  );
}

function Header({
  isWelcomePage = false,
  isDemoMission = false,
  isHostPreview = false,
  isCollaboratorPreview = false,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, isAuthenticated, signOut } = useAuth();

  const headerRef = useRef(null);

  const [activeSection, setActiveSection] = useState("");

  const isAppRoute = location.pathname === "/app";

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

    let animationFrameId = null;

    const updateActiveSection = () => {
      animationFrameId = null;

      const availableSections = sectionLinks
        .map((section) => ({
          ...section,
          element: document.getElementById(section.id),
        }))
        .filter((section) => section.element);

      if (availableSections.length === 0) {
        return;
      }

      const headerBottom =
        headerRef.current?.getBoundingClientRect().bottom || 0;

      const activationLine = headerBottom + 32;

      const documentElement = document.documentElement;

      const isAtPageBottom =
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >= documentElement.scrollHeight - 4;

      let nextActiveSection = availableSections[0].id;

      if (isAtPageBottom) {
        nextActiveSection = availableSections[availableSections.length - 1].id;
      } else {
        availableSections.forEach((section) => {
          const sectionTop = section.element.getBoundingClientRect().top;

          if (sectionTop <= activationLine) {
            nextActiveSection = section.id;
          }
        });
      }

      setActiveSection((currentSection) =>
        currentSection === nextActiveSection
          ? currentSection
          : nextActiveSection,
      );
    };

    const scheduleActiveSectionUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();

    window.addEventListener("scroll", scheduleActiveSectionUpdate, {
      passive: true,
    });

    window.addEventListener("resize", scheduleActiveSectionUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleActiveSectionUpdate);

      window.removeEventListener("resize", scheduleActiveSectionUpdate);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [sectionLinks]);

  const handleSignOut = () => {
    signOut();

    navigate("/", {
      replace: true,
    });
  };

  const handleSectionNavigation = (event, sectionId) => {
    event.preventDefault();

    const targetSection = document.getElementById(sectionId);

    if (!targetSection) {
      return;
    }

    const headerBottom = headerRef.current?.getBoundingClientRect().bottom || 0;

    const targetTop =
      window.scrollY +
      targetSection.getBoundingClientRect().top -
      headerBottom -
      16;

    setActiveSection(sectionId);

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: "smooth",
    });
  };

  const sectionNavigationLabel = isHostPreview
    ? "Host dashboard sections"
    : isAppRoute
      ? "Application dashboard sections"
      : "Collaborator dashboard sections";

  const logoDestination = isAuthenticated ? "/app" : "/";

  const logoLabel = isAuthenticated
    ? "Return to the SkillForge dashboard"
    : "Return to the SkillForge home page";

  const headerClassName = [
    "header",
    sectionLinks.length > 0 && "header--workspace-preview",
    isWelcomePage && "header--welcome",
    isDemoMission && "header--demo",
    isAuthenticated && "header--authenticated",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header ref={headerRef} className={headerClassName}>
      <div className="header__inner">
        <div className="header__left">
          <Link
            to={logoDestination}
            className="header__logo-link"
            aria-label={logoLabel}
            title={isAuthenticated ? "Return to Dashboard" : "Return to Home"}
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
            isAuthenticated ? (
              <div className="header__authenticated-controls">
                <nav
                  className="header__nav"
                  aria-label="Authenticated navigation"
                >
                  <NavLink to="/app" end className={getPrimaryNavClassName}>
                    Dashboard
                  </NavLink>
                </nav>

                <AuthenticatedAccount
                  currentUser={currentUser}
                  onSignOut={handleSignOut}
                />
              </div>
            ) : (
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
            )
          ) : isDemoMission ? (
            <nav
              className="header__nav header__nav--demo"
              aria-label="Demo navigation"
            >
              <span className="header__demo-label">Mission Simulation</span>

              <Link
                className="header__nav-link header__nav-link--cta"
                to={isAuthenticated ? "/app" : "/"}
              >
                Exit Demo
              </Link>
            </nav>
          ) : isAuthenticated ? (
            <div className="header__authenticated-controls">
              <nav
                className="header__nav header__nav--authenticated"
                aria-label="Primary navigation"
              >
                <NavLink to="/app" end className={getPrimaryNavClassName}>
                  Dashboard
                </NavLink>

                <NavLink
                  to="/host-preview"
                  end
                  className={getPrimaryNavClassName}
                >
                  Host Demo
                </NavLink>

                <NavLink
                  to="/collaborator-preview"
                  end
                  className={getPrimaryNavClassName}
                >
                  Collaborator Demo
                </NavLink>
              </nav>

              <AuthenticatedAccount
                currentUser={currentUser}
                onSignOut={handleSignOut}
              />
            </div>
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

              <NavLink to="/signin" end className={getPrimaryNavClassName}>
                Sign In
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
                  onClick={(event) =>
                    handleSectionNavigation(event, section.id)
                  }
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
