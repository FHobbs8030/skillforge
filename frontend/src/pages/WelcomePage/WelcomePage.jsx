import { Link } from "react-router-dom";

import "./WelcomePage.css";

const workflowSteps = [
  {
    number: "01",
    title: "Create or join a project",
    description:
      "Host your own project or accept an invitation to collaborate on someone else’s work.",
  },
  {
    number: "02",
    title: "Organize the work",
    description:
      "Create focused work sections, assign responsibilities, and make priorities visible.",
  },
  {
    number: "03",
    title: "Build with clear communication",
    description:
      "Keep project conversations, progress updates, and development activity connected.",
  },
];

const hostBenefits = [
  "Create and organize project work sections",
  "Assign collaborators to focused responsibilities",
  "Track section progress and project activity",
  "Coordinate priorities, deadlines, and communication",
  "Connect project work with GitHub activity",
];

const collaboratorBenefits = [
  "See assigned and available work clearly",
  "Understand project priorities before starting",
  "Communicate directly within the project workflow",
  "Share progress and surface blockers",
  "Participate in multiple projects with different roles",
];

const membershipPlans = [
  {
    id: "free",
    name: "Free",
    description:
      "A practical starting point for individual developers and small projects.",
    features: [
      "1 active hosted project",
      "Up to 3 collaborators",
      "Unlimited collaborator participation",
      "Limited active work sections",
      "Basic project communication",
      "Basic GitHub connection",
      "Limited activity history",
    ],
    action: "Start with Free",
  },
  {
    id: "pro",
    name: "Pro",
    description:
      "More capacity and project-management tools for active builders.",
    features: [
      "Multiple hosted projects",
      "More collaborators",
      "More active work sections",
      "Full communication history",
      "Advanced GitHub activity",
      "Project templates",
      "Priority and deadline tools",
      "Enhanced notifications",
    ],
    action: "Choose Pro",
    featured: true,
  },
  {
    id: "team",
    name: "Team",
    description:
      "Expanded administration and collaboration controls for larger teams.",
    features: [
      "Multiple hosts and co-hosts",
      "Larger project teams",
      "Permission management",
      "Team reporting",
      "Administrative controls",
      "Meeting integrations",
      "Advanced activity history",
      "Priority support",
    ],
    action: "Explore Team",
  },
];

function WelcomePage() {
  return (
    <div className="welcome-page">
      <section className="welcome-hero" aria-labelledby="welcome-title">
        <div className="welcome-hero__glow welcome-hero__glow--left" />
        <div className="welcome-hero__glow welcome-hero__glow--right" />

        <div className="welcome-hero__content">
          <p className="welcome-page__eyebrow">
            A communication-first project workspace
          </p>

          <h1 id="welcome-title" className="welcome-hero__title">
            Organize work.
            <span> Communicate clearly.</span> Build together.
          </h1>

          <p className="welcome-hero__description">
            SkillForge helps developers organize projects, coordinate work,
            communicate with teammates, and build stronger software together.
          </p>

          <div className="welcome-hero__actions">
            <Link className="welcome-button welcome-button--primary" to="/demo">
              Try SkillForge Mission
            </Link>

            <a
              className="welcome-button welcome-button--secondary"
              href="#memberships"
            >
              View Memberships
            </a>
          </div>

          <div
            className="welcome-hero__highlights"
            aria-label="SkillForge platform highlights"
          >
            <div className="welcome-highlight">
              <strong>One account</strong>
              <span>Across every SkillForge project</span>
            </div>

            <div className="welcome-highlight">
              <strong>Flexible roles</strong>
              <span>Host, co-host, or collaborator</span>
            </div>

            <div className="welcome-highlight">
              <strong>Connected work</strong>
              <span>Communication and GitHub activity</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="welcome-section welcome-section--intro"
        aria-labelledby="about-title"
      >
        <div className="welcome-section__heading">
          <p className="welcome-page__eyebrow">About SkillForge</p>

          <h2 id="about-title">
            A clearer way to coordinate software projects
          </h2>

          <p>
            SkillForge brings project responsibilities, communication,
            development activity, and team awareness into one shared workspace.
          </p>
        </div>

        <div className="welcome-about-grid">
          <article className="welcome-feature-card">
            <span className="welcome-feature-card__label">Projects</span>

            <h3>Keep work structured</h3>

            <p>
              Break projects into focused sections so everyone understands what
              is available, assigned, active, and completed.
            </p>
          </article>

          <article className="welcome-feature-card">
            <span className="welcome-feature-card__label">Roles</span>

            <h3>Work differently on every project</h3>

            <p>
              Your membership stays with your account while your host, co-host,
              or collaborator role is assigned separately for each project.
            </p>
          </article>

          <article className="welcome-feature-card">
            <span className="welcome-feature-card__label">Communication</span>

            <h3>Keep decisions connected</h3>

            <p>
              Discuss work where it happens instead of losing important project
              context across disconnected messages and tools.
            </p>
          </article>
        </div>
      </section>

      <section
        id="how-it-works"
        className="welcome-section"
        aria-labelledby="how-it-works-title"
      >
        <div className="welcome-section__heading">
          <p className="welcome-page__eyebrow">How SkillForge works</p>

          <h2 id="how-it-works-title">
            Move from project idea to coordinated execution
          </h2>
        </div>

        <div className="welcome-workflow">
          {workflowSteps.map((step) => (
            <article key={step.number} className="welcome-workflow__step">
              <span className="welcome-workflow__number">{step.number}</span>

              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="welcome-section welcome-section--roles"
        aria-labelledby="roles-title"
      >
        <div className="welcome-section__heading">
          <p className="welcome-page__eyebrow">Built for every project role</p>

          <h2 id="roles-title">
            Lead the project or contribute where you are needed
          </h2>
        </div>

        <div className="welcome-role-grid">
          <article className="welcome-role-card">
            <div className="welcome-role-card__header">
              <span className="welcome-role-card__badge">Host</span>
              <h3>Build the project workspace</h3>
            </div>

            <p>
              Give collaborators a clear structure, visible priorities, and the
              information they need to contribute effectively.
            </p>

            <ul>
              {hostBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>

            <Link className="welcome-role-card__link" to="/host-preview">
              View the Host Dashboard
            </Link>
          </article>

          <article className="welcome-role-card">
            <div className="welcome-role-card__header">
              <span className="welcome-role-card__badge">Collaborator</span>

              <h3>Find and complete meaningful work</h3>
            </div>

            <p>
              Understand what the project needs, select or receive work, and
              stay connected with the people building alongside you.
            </p>

            <ul>
              {collaboratorBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>

            <Link
              className="welcome-role-card__link"
              to="/collaborator-preview"
            >
              View the Collaborator Dashboard
            </Link>
          </article>
        </div>
      </section>

      <section
        className="welcome-section welcome-communication"
        aria-labelledby="communication-title"
      >
        <div className="welcome-communication__content">
          <p className="welcome-page__eyebrow">Communication-first workflow</p>

          <h2 id="communication-title">
            Project communication should support the work—not compete with it
          </h2>

          <p>
            SkillForge is designed to keep questions, decisions, updates, and
            blockers connected to the project structure. Teams gain clearer
            context without relying on scattered conversations.
          </p>
        </div>

        <div className="welcome-communication__panel">
          <div className="welcome-message">
            <span className="welcome-message__author">Project Host</span>
            <p>
              Authentication is ready for review. Please verify the mobile
              validation flow.
            </p>
          </div>

          <div className="welcome-message welcome-message--response">
            <span className="welcome-message__author">Collaborator</span>
            <p>
              I will test the mobile flow and post the results in this work
              section.
            </p>
          </div>

          <div className="welcome-message">
            <span className="welcome-message__author">Project update</span>
            <p>Mobile authentication validation moved to active work.</p>
          </div>
        </div>
      </section>

      <section
        id="memberships"
        className="welcome-section"
        aria-labelledby="memberships-title"
      >
        <div className="welcome-section__heading">
          <p className="welcome-page__eyebrow">Membership plans</p>

          <h2 id="memberships-title">
            Start small and expand as your projects grow
          </h2>

          <p>
            Membership controls platform capacity and features. Your project
            role remains separate and can change from project to project.
          </p>
        </div>

        <div className="welcome-membership-grid">
          {membershipPlans.map((plan) => (
            <article
              key={plan.name}
              className={`welcome-plan${
                plan.featured ? " welcome-plan--featured" : ""
              }`}
            >
              {plan.featured && (
                <span className="welcome-plan__featured-label">
                  Recommended
                </span>
              )}

              <div className="welcome-plan__header">
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>

              <ul className="welcome-plan__features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <Link
                className={`welcome-button ${
                  plan.featured
                    ? "welcome-button--primary"
                    : "welcome-button--secondary"
                }`}
                to={`/signup?plan=${plan.id}`}
              >
                {plan.action}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        id="get-started"
        className="welcome-cta"
        aria-labelledby="welcome-cta-title"
      >
        <div>
          <p className="welcome-page__eyebrow">Build better together</p>

          <h2 id="welcome-cta-title">
            Bring structure and clarity to your next project
          </h2>

          <p>
            Explore the current SkillForge dashboards and see how hosts and
            collaborators can work from one connected platform.
          </p>
        </div>

        <div className="welcome-cta__actions">
          <Link
            className="welcome-button welcome-button--primary"
            to="/host-preview"
          >
            Explore Host Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

export default WelcomePage;
