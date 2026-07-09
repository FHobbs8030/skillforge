import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import useAuth from "../../contexts/useAuth";
import {
  acceptProjectInvitation,
  declineProjectInvitation,
  getPendingProjectInvitations,
  getProjects,
} from "../../utils/api";

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

const roleWorkspaceDetails = {
  owner: {
    label: "Owner",
    accessLabel: "Host Workspace",
    badgeLabel: "Host tools",
    actionLabel: "Open Host Workspace",
    description:
      "Manage project setup, repository connections, members, invitations, and activity.",
    tone: "host",
  },
  host: {
    label: "Host",
    accessLabel: "Host Workspace",
    badgeLabel: "Host tools",
    actionLabel: "Open Host Workspace",
    description:
      "Manage project coordination, repository setup, collaborators, and workspace activity.",
    tone: "host",
  },
  collaborator: {
    label: "Collaborator",
    accessLabel: "Collaborator Workspace",
    badgeLabel: "Collaborator tools",
    actionLabel: "Open Collaborator Workspace",
    description:
      "Review assigned project work, activity history, repository details, and collaboration updates.",
    tone: "collaborator",
  },
  viewer: {
    label: "Viewer",
    accessLabel: "Read-only Overview",
    badgeLabel: "Read-only",
    actionLabel: "Open Project Overview",
    description:
      "View project details, member context, repository information, and activity history without edit access.",
    tone: "viewer",
  },
  member: {
    label: "Member",
    accessLabel: "Project Overview",
    badgeLabel: "Project access",
    actionLabel: "Open Project",
    description:
      "Review the project workspace available to your SkillForge account.",
    tone: "member",
  },
};

function normalizeProjects(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.projects)) {
    return response.projects;
  }

  if (Array.isArray(response?.data?.projects)) {
    return response.data.projects;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

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

function getProjectId(project) {
  return project?._id || project?.id || project?.projectId || "";
}

function getProjectName(project) {
  return project?.name || project?.title || "Untitled project";
}

function getProjectDescription(project) {
  return (
    project?.description ||
    "This SkillForge project is connected to your authenticated account."
  );
}

function getProjectRole(project) {
  return (
    project?.role ||
    project?.memberRole ||
    project?.membershipRole ||
    project?.membership?.role ||
    project?.projectMembership?.role ||
    "member"
  );
}

function getProjectStatus(project) {
  return project?.status || "active";
}

function getRoleWorkspaceDetails(role) {
  const normalizedRole = typeof role === "string" ? role.toLowerCase() : "";

  return roleWorkspaceDetails[normalizedRole] || roleWorkspaceDetails.member;
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

function formatCountLabel(
  count,
  singularLabel,
  pluralLabel = `${singularLabel}s`,
) {
  return `${count} ${count === 1 ? singularLabel : pluralLabel}`;
}

function AppDashboard() {
  const { currentUser, token } = useAuth();

  const [projectInvitations, setProjectInvitations] = useState([]);
  const [isInvitationLoading, setIsInvitationLoading] = useState(true);
  const [invitationErrorMessage, setInvitationErrorMessage] = useState("");
  const [respondingInvitationId, setRespondingInvitationId] = useState("");

  const [projects, setProjects] = useState([]);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [projectErrorMessage, setProjectErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadPendingInvitations() {
      if (!token) {
        setProjectInvitations([]);
        setIsInvitationLoading(false);
        return;
      }

      setIsInvitationLoading(true);
      setInvitationErrorMessage("");

      try {
        const response = await getPendingProjectInvitations(token);
        const invitations = Array.isArray(response?.invitations)
          ? response.invitations
          : [];

        if (isActive) {
          setProjectInvitations(invitations);
        }
      } catch (error) {
        if (isActive) {
          setInvitationErrorMessage(
            error?.message ||
              "Project invitations could not be loaded. Please try again.",
          );
        }
      } finally {
        if (isActive) {
          setIsInvitationLoading(false);
        }
      }
    }

    loadPendingInvitations();

    return () => {
      isActive = false;
    };
  }, [token]);

  useEffect(() => {
    let isActive = true;

    async function loadProjects() {
      if (!token) {
        setProjects([]);
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);
      setProjectErrorMessage("");

      try {
        const response = await getProjects(token);
        const projectList = normalizeProjects(response);

        if (isActive) {
          setProjects(projectList);
        }
      } catch (error) {
        if (isActive) {
          setProjectErrorMessage(
            error?.message ||
              "Project workspaces could not be loaded. Please try again.",
          );
        }
      } finally {
        if (isActive) {
          setIsProjectLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      isActive = false;
    };
  }, [token]);

  async function refreshProjectsAfterInvitationResponse() {
    try {
      const response = await getProjects(token);
      setProjects(normalizeProjects(response));
      setProjectErrorMessage("");
    } catch (error) {
      setProjectErrorMessage(
        error?.message ||
          "Invitation updated, but project workspaces could not be refreshed.",
      );
    }
  }

  async function handleAcceptInvitation(invitation) {
    const projectId = invitation?.projectId;

    if (!projectId) {
      return;
    }

    setRespondingInvitationId(invitation.id);
    setInvitationErrorMessage("");

    try {
      await acceptProjectInvitation({ token, projectId });

      setProjectInvitations((currentInvitations) =>
        currentInvitations.filter(
          (currentInvitation) => currentInvitation.id !== invitation.id,
        ),
      );

      await refreshProjectsAfterInvitationResponse();
    } catch (error) {
      setInvitationErrorMessage(
        error?.message ||
          "Project invitation could not be accepted. Please try again.",
      );
    } finally {
      setRespondingInvitationId("");
    }
  }

  async function handleDeclineInvitation(invitation) {
    const projectId = invitation?.projectId;

    if (!projectId) {
      return;
    }

    setRespondingInvitationId(invitation.id);
    setInvitationErrorMessage("");

    try {
      await declineProjectInvitation({ token, projectId });

      setProjectInvitations((currentInvitations) =>
        currentInvitations.filter(
          (currentInvitation) => currentInvitation.id !== invitation.id,
        ),
      );
    } catch (error) {
      setInvitationErrorMessage(
        error?.message ||
          "Project invitation could not be declined. Please try again.",
      );
    } finally {
      setRespondingInvitationId("");
    }
  }

  const displayName = getDisplayName(currentUser);
  const firstName = getFirstName(displayName);

  const membershipKey = currentUser?.membership?.toLowerCase() || "free";
  const membership = membershipDetails[membershipKey] || membershipDetails.free;

  const projectStats = useMemo(() => {
    const totalProjects = projects.length;

    const roleCounts = projects.reduce(
      (counts, project) => {
        const role = getProjectRole(project).toLowerCase();

        return {
          ...counts,
          [role]: (counts[role] || 0) + 1,
        };
      },
      {
        owner: 0,
        host: 0,
        collaborator: 0,
        viewer: 0,
      },
    );

    const hostWorkspaceCount = roleCounts.owner + roleCounts.host;
    const collaboratorWorkspaceCount = roleCounts.collaborator;
    const viewerWorkspaceCount = roleCounts.viewer;

    const primaryRoleLabel =
      totalProjects === 0
        ? "Not assigned"
        : totalProjects === 1
          ? getRoleWorkspaceDetails(getProjectRole(projects[0])).label
          : `${totalProjects} project roles`;

    return {
      totalProjects,
      hostWorkspaceCount,
      collaboratorWorkspaceCount,
      viewerWorkspaceCount,
      primaryRoleLabel,
    };
  }, [projects]);

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
      detail:
        projectStats.totalProjects > 0
          ? `${formatCountLabel(projectStats.totalProjects, "project workspace")} connected.`
          : "No project workspace has been connected yet.",
      complete: projectStats.totalProjects > 0,
    },
    {
      id: "role-based-access",
      label: "Role-based access",
      detail:
        projectStats.totalProjects > 0
          ? "Your dashboard can open the correct workspace experience by role."
          : "Accept or create a project role to unlock workspace access.",
      complete: projectStats.totalProjects > 0,
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
      value: isProjectLoading
        ? "Loading"
        : projectStats.totalProjects > 0
          ? `${projectStats.totalProjects} Active`
          : "Not Connected",
      detail:
        projectStats.totalProjects > 0
          ? "Role-based access ready"
          : "Project workflow is next",
      tone: "purple",
    },
    {
      id: "roles",
      label: "Project Role",
      value: projectStats.primaryRoleLabel,
      detail:
        projectStats.hostWorkspaceCount > 0
          ? "Host tools available"
          : projectStats.collaboratorWorkspaceCount > 0
            ? "Collaborator tools available"
            : projectStats.viewerWorkspaceCount > 0
              ? "Read-only access available"
              : "Awaiting assignment",
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
            This is your private SkillForge workspace. Project invitations,
            role-based access, and project activity are now connected to your
            authenticated account.
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
        id="app-invitations"
        aria-labelledby="project-invitations-title"
      >
        <div className="app-dashboard__section-heading">
          <div>
            <p className="app-dashboard__panel-eyebrow">Project Invitations</p>

            <h2 id="project-invitations-title">Pending invitations</h2>

            <p>
              Review project invitations sent to your SkillForge account. You
              can accept a project role or decline the invitation.
            </p>
          </div>
        </div>

        <article className="app-dashboard__panel app-dashboard__invitations-panel">
          <div className="app-dashboard__panel-heading">
            <div>
              <p className="app-dashboard__panel-eyebrow">
                Invitation Response
              </p>

              <h3>
                {projectInvitations.length > 0
                  ? `${projectInvitations.length} pending`
                  : "No pending invitations"}
              </h3>
            </div>

            <span className="app-dashboard__count-badge">
              {projectInvitations.length}
            </span>
          </div>

          {isInvitationLoading && (
            <div className="app-dashboard__invitation-state">
              Loading project invitations...
            </div>
          )}

          {!isInvitationLoading && invitationErrorMessage && (
            <div className="app-dashboard__invitation-state app-dashboard__invitation-state--error">
              {invitationErrorMessage}
            </div>
          )}

          {!isInvitationLoading &&
            !invitationErrorMessage &&
            projectInvitations.length === 0 && (
              <div className="app-dashboard__invitation-state">
                You do not have any pending project invitations right now.
              </div>
            )}

          {!isInvitationLoading &&
            !invitationErrorMessage &&
            projectInvitations.length > 0 && (
              <ul className="app-dashboard__invitation-list">
                {projectInvitations.map((invitation) => {
                  const isResponding = respondingInvitationId === invitation.id;

                  return (
                    <li
                      className="app-dashboard__invitation-item"
                      key={invitation.id}
                    >
                      <div>
                        <span className="app-dashboard__status-badge">
                          {invitation.role}
                        </span>

                        <h4>{invitation.projectName}</h4>

                        <p>
                          {invitation.projectDescription ||
                            "You have been invited to join this SkillForge project."}
                        </p>

                        {invitation.invitedBy && (
                          <p className="app-dashboard__invitation-meta">
                            Invited by {invitation.invitedBy.fullName}
                          </p>
                        )}
                      </div>

                      <div className="app-dashboard__invitation-actions">
                        <button
                          className="app-dashboard__invitation-button app-dashboard__invitation-button--accept"
                          type="button"
                          disabled={isResponding}
                          onClick={() => handleAcceptInvitation(invitation)}
                        >
                          {isResponding ? "Working..." : "Accept"}
                        </button>

                        <button
                          className="app-dashboard__invitation-button app-dashboard__invitation-button--decline"
                          type="button"
                          disabled={isResponding}
                          onClick={() => handleDeclineInvitation(invitation)}
                        >
                          Decline
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
        </article>
      </section>

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
              Your authenticated account is established. SkillForge now checks
              active project roles and opens the correct workspace path for each
              project.
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
        aria-labelledby="project-access-title"
      >
        <div className="app-dashboard__section-heading">
          <div>
            <p className="app-dashboard__panel-eyebrow">Project Access</p>

            <h2 id="project-access-title">Role-based dashboard access</h2>

            <p>
              Open the correct SkillForge workspace experience based on your
              active project role.
            </p>
          </div>
        </div>

        {isProjectLoading && (
          <article className="app-dashboard__panel app-dashboard__role-state">
            Loading active project roles...
          </article>
        )}

        {!isProjectLoading && projectErrorMessage && (
          <article className="app-dashboard__panel app-dashboard__role-state app-dashboard__role-state--error">
            {projectErrorMessage}
          </article>
        )}

        {!isProjectLoading &&
          !projectErrorMessage &&
          projectStats.totalProjects === 0 && (
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
                  You are signed in successfully, but this account has not yet
                  been assigned a Host, Collaborator, or Viewer project role.
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
                        Open the correct Host, Collaborator, or Viewer tools for
                        each project.
                      </p>
                    </div>

                    <span>Ready</span>
                  </li>

                  <li>
                    <div>
                      <strong>GitHub development activity</strong>
                      <p>
                        Connect repositories, commits, pull requests, and
                        project progress.
                      </p>
                    </div>

                    <span>Planned</span>
                  </li>
                </ul>
              </article>
            </div>
          )}

        {!isProjectLoading &&
          !projectErrorMessage &&
          projectStats.totalProjects > 0 && (
            <div className="app-dashboard__role-grid">
              {projects.map((project) => {
                const projectId = getProjectId(project);
                const projectRole = getProjectRole(project);
                const workspaceDetails = getRoleWorkspaceDetails(projectRole);

                return (
                  <article
                    className={`app-dashboard__panel app-dashboard__role-card app-dashboard__role-card--${workspaceDetails.tone}`}
                    key={projectId || getProjectName(project)}
                  >
                    <div className="app-dashboard__role-card-main">
                      <span className="app-dashboard__role-badge">
                        {workspaceDetails.badgeLabel}
                      </span>

                      <h3>{getProjectName(project)}</h3>

                      <p>{getProjectDescription(project)}</p>
                    </div>

                    <dl className="app-dashboard__role-meta">
                      <div>
                        <dt>Role</dt>
                        <dd>{workspaceDetails.label}</dd>
                      </div>

                      <div>
                        <dt>Workspace</dt>
                        <dd>{workspaceDetails.accessLabel}</dd>
                      </div>

                      <div>
                        <dt>Status</dt>
                        <dd>{getProjectStatus(project)}</dd>
                      </div>
                    </dl>

                    <p className="app-dashboard__role-description">
                      {workspaceDetails.description}
                    </p>

                    {projectId && (
                      <Link
                        className="app-dashboard__role-card-link"
                        to={`/projects/${projectId}`}
                      >
                        {workspaceDetails.actionLabel}
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          )}
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
              These details come from your authenticated SkillForge account and
              active project memberships.
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
                <dd>{projectStats.primaryRoleLabel}</dd>
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
