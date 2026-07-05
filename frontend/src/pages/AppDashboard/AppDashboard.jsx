import useAuth from "../../contexts/useAuth";

import "./AppDashboard.css";

const membershipDetails = {
  free: {
    label: "Free",
    description:
      "Your SkillForge account is active and ready for workspace setup.",
  },
  pro: {
    label: "Pro",
    description:
      "Your SkillForge Pro account is active and ready for workspace setup.",
  },
  team: {
    label: "Team",
    description:
      "Your SkillForge Team account is active and ready for collaboration setup.",
  },
};

function getDisplayName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    "SkillForge Member"
  );
}

function getFirstName(displayName) {
  if (displayName.includes("@")) {
    return "Member";
  }

  return displayName.trim().split(/\s+/)[0] || "Member";
}

function formatMemberSince(createdAt) {
  if (!createdAt) {
    return "Recently joined";
  }

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return "Recently joined";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(createdDate);
}

function AppDashboard() {
  const { currentUser } = useAuth();

  const displayName = getDisplayName(currentUser);
  const firstName = getFirstName(displayName);

  const membershipKey = currentUser?.membership?.toLowerCase() || "free";

  const membership = membershipDetails[membershipKey] || membershipDetails.free;

  const readinessItems = [
    {
      id: "authenticated-account",
      label: "Authenticated account",
      detail: "Your protected SkillForge session is active.",
      complete: true,
    },
    {
      id: "member-identity",
      label: "Member identity",
      detail: currentUser?.fullName
        ? "Your member name is available."
        : "Add your full name to your profile.",
      complete: Boolean(currentUser?.fullName),
    },
    {
      id: "membership",
      label: "Membership selected",
      detail: `${membership.label} membership is assigned to your account.`,
      complete: Boolean(currentUser?.membership),
    },
    {
      id: "project-workspace",
      label: "Project workspace",
      detail: "No project workspace has been connected yet.",
      complete: false,
    },
    {
      id: "github-profile",
      label: "GitHub connection",
      detail: "GitHub account connection will be added in a later phase.",
      complete: false,
    },
  ];

  const completedReadinessItems = readinessItems.filter(
    (item) => item.complete,
  ).length;

  const readinessPercentage = Math.round(
    (completedReadinessItems / readinessItems.length) * 100,
  );

  const overviewMetrics = [
    {
      id: "membership",
      label: "Membership",
      value: membership.label,
      detail: "Current account plan",
      tone: "blue",
    },
    {
      id: "account",
      label: "Account Status",
      value: "Active",
      detail: "Protected session available",
      tone: "teal",
    },
    {
      id: "projects",
      label: "Project Workspace",
      value: "Not Connected",
      detail: "Project workflow is next",
      tone: "purple",
    },
    {
      id: "github",
      label: "GitHub Profile",
      value: "Not Connected",
      detail: "Integration is planned",
      tone: "orange",
    },
  ];

  return (
    <section className="app-dashboard" aria-labelledby="app-dashboard-title">
      <header
        className="app-dashboard__header app-dashboard__section-anchor"
        id="app-overview"
      >
        <div>
          <p className="app-dashboard__eyebrow">
            Authenticated Member Workspace
          </p>

          <h1 className="app-dashboard__title" id="app-dashboard-title">
            Welcome back, {firstName}
          </h1>

          <p className="app-dashboard__subtitle">
            This is your private SkillForge workspace. As project, profile, and
            GitHub capabilities are connected, this dashboard will become the
            central view of your development activity.
          </p>
        </div>

        <div className="app-dashboard__membership">
          <span className="app-dashboard__membership-label">Membership</span>

          <strong>{membership.label}</strong>

          <span className="app-dashboard__membership-status">Active</span>
        </div>
      </header>

      <div
        className="app-dashboard__metrics"
        aria-label="Account and workspace overview"
      >
        {overviewMetrics.map((metric) => (
          <article
            key={metric.id}
            className={`app-dashboard__metric app-dashboard__metric--${metric.tone}`}
          >
            <span className="app-dashboard__metric-label">{metric.label}</span>

            <strong className="app-dashboard__metric-value">
              {metric.value}
            </strong>

            <span className="app-dashboard__metric-detail">
              {metric.detail}
            </span>
          </article>
        ))}
      </div>

      <section
        className="app-dashboard__section app-dashboard__section-anchor"
        id="app-workspace"
        aria-labelledby="workspace-readiness-title"
      >
        <div className="app-dashboard__section-heading">
          <div>
            <p className="app-dashboard__panel-eyebrow">Workspace Setup</p>

            <h2 id="workspace-readiness-title">
              Prepare your development workspace
            </h2>

            <p>
              Your authenticated account is established. The remaining workspace
              capabilities will be connected incrementally.
            </p>
          </div>
        </div>

        <div className="app-dashboard__workspace-grid">
          <article className="app-dashboard__panel">
            <div className="app-dashboard__panel-heading">
              <div>
                <p className="app-dashboard__panel-eyebrow">
                  Account Readiness
                </p>

                <h3>{readinessPercentage}% ready</h3>
              </div>

              <span className="app-dashboard__count-badge">
                {completedReadinessItems}/{readinessItems.length}
              </span>
            </div>

            <div
              className="app-dashboard__progress-track"
              role="progressbar"
              aria-label="Account and workspace readiness"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={readinessPercentage}
            >
              <span
                className="app-dashboard__progress-fill"
                style={{
                  width: `${readinessPercentage}%`,
                }}
              />
            </div>

            <ul className="app-dashboard__readiness-list">
              {readinessItems.map((item) => (
                <li
                  key={item.id}
                  className={`app-dashboard__readiness-item${
                    item.complete
                      ? " app-dashboard__readiness-item--complete"
                      : ""
                  }`}
                >
                  <span
                    className="app-dashboard__readiness-indicator"
                    aria-hidden="true"
                  >
                    {item.complete ? "✓" : "•"}
                  </span>

                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>

                  <span className="app-dashboard__readiness-status">
                    {item.complete ? "Ready" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="app-dashboard__panel app-dashboard__membership-panel">
            <div>
              <p className="app-dashboard__panel-eyebrow">Current Membership</p>

              <h3>{membership.label}</h3>

              <p className="app-dashboard__membership-description">
                {membership.description}
              </p>
            </div>

            <dl className="app-dashboard__detail-list">
              <div>
                <dt>Account</dt>
                <dd>{displayName}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>Authenticated</dd>
              </div>

              <div>
                <dt>Member Since</dt>
                <dd>{formatMemberSince(currentUser?.createdAt)}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section
        className="app-dashboard__section app-dashboard__section-anchor"
        id="app-activity"
        aria-labelledby="project-activity-title"
      >
        <div className="app-dashboard__section-heading">
          <div>
            <p className="app-dashboard__panel-eyebrow">Project Activity</p>

            <h2 id="project-activity-title">Your SkillForge activity</h2>

            <p>
              Project assignments, work-section progress, messages, and GitHub
              updates will appear here after those systems are connected.
            </p>
          </div>
        </div>

        <div className="app-dashboard__activity-grid">
          <article className="app-dashboard__panel app-dashboard__empty-state">
            <span className="app-dashboard__status-badge">
              No active project
            </span>

            <div
              className="app-dashboard__empty-state-symbol"
              aria-hidden="true"
            >
              SF
            </div>

            <h3>Your project workspace is ready to be connected</h3>

            <p>
              You are signed in successfully, but this account has not yet been
              assigned a Host or Collaborator project role.
            </p>
          </article>

          <article className="app-dashboard__panel">
            <div className="app-dashboard__panel-heading">
              <div>
                <p className="app-dashboard__panel-eyebrow">
                  Planned Capabilities
                </p>

                <h3>Coming to this workspace</h3>
              </div>
            </div>

            <ul className="app-dashboard__capability-list">
              <li>
                <div>
                  <strong>Create or join projects</strong>
                  <p>Connect members to real SkillForge workspaces.</p>
                </div>

                <span>Planned</span>
              </li>

              <li>
                <div>
                  <strong>Role-based dashboard access</strong>
                  <p>
                    Open the correct Host or Collaborator tools for each
                    project.
                  </p>
                </div>

                <span>Planned</span>
              </li>

              <li>
                <div>
                  <strong>GitHub development activity</strong>
                  <p>
                    Connect repositories, commits, pull requests, and project
                    progress.
                  </p>
                </div>

                <span>Planned</span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section
        className="app-dashboard__section app-dashboard__section-anchor"
        id="app-account"
        aria-labelledby="account-summary-title"
      >
        <div className="app-dashboard__section-heading">
          <div>
            <p className="app-dashboard__panel-eyebrow">Member Account</p>

            <h2 id="account-summary-title">Account summary</h2>

            <p>
              These details come from your authenticated SkillForge account.
            </p>
          </div>
        </div>

        <div className="app-dashboard__account-grid">
          <article className="app-dashboard__panel">
            <dl className="app-dashboard__account-details">
              <div>
                <dt>Full Name</dt>
                <dd>{displayName}</dd>
              </div>

              <div>
                <dt>Email Address</dt>
                <dd>{currentUser?.email || "Not available"}</dd>
              </div>

              <div>
                <dt>Membership</dt>
                <dd>{membership.label}</dd>
              </div>

              <div>
                <dt>Project Role</dt>
                <dd>Not assigned</dd>
              </div>
            </dl>
          </article>

          <article className="app-dashboard__panel app-dashboard__security-panel">
            <p className="app-dashboard__panel-eyebrow">Session Security</p>

            <h3>Protected access is active</h3>

            <p>
              This dashboard is available only while a valid authenticated
              SkillForge session is present.
            </p>

            <div className="app-dashboard__security-status">
              <span aria-hidden="true">✓</span>

              <div>
                <strong>Session verified</strong>
                <p>Your account data was accepted by the SkillForge API.</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  );
}

export default AppDashboard;
