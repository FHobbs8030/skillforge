import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import "./ProjectDetail.css";

import {
  archiveProject,
  connectProjectRepository,
  getProjectActivity,
  getProjectById,
  getProjectMembers,
  inviteProjectMember,
  updateProject,
} from "../../utils/api";

import useAuth from "../../contexts/useAuth";
import {
  getUserAvatarUrl,
  getUserInitials,
} from "../../utils/avatar";

const projectRoleDetails = {
  owner: {
    label: "Owner",
    accessLabel: "Full management access",
    tone: "owner",
    heroEyebrow: "Owner Workspace",
    heroSubtitle:
      "You can manage project setup, repository connection, member invitations, project membership, and activity review.",
    overviewTitle: "Owner project controls",
    overviewSummary:
      "Owner access includes full project management permissions for this SkillForge workspace.",
    repositoryTitle: "Repository Management",
    repositoryEmpty:
      "Connect a GitHub repository to display source control metadata for this project.",
    repositoryNoteTitle: "Repository management enabled",
    repositoryNote:
      "Owners can connect or update the GitHub repository attached to this project.",
    membersEyebrow: "Team Management",
    membersTitle: "Project Members",
    inviteNoteTitle: "Member invitations enabled",
    inviteNote:
      "Owners can invite hosts, collaborators, and viewers into this project workspace.",
    activityTitle: "Project Timeline",
    activityEmpty:
      "Project timeline events will appear here as collaboration activity is recorded.",
  },
  host: {
    label: "Host",
    accessLabel: "Host management access",
    tone: "host",
    heroEyebrow: "Host Workspace",
    heroSubtitle:
      "You can coordinate the project workspace, manage repository setup, invite members, and review project activity.",
    overviewTitle: "Host project controls",
    overviewSummary:
      "Host access supports day-to-day project coordination and workspace management.",
    repositoryTitle: "Repository Management",
    repositoryEmpty:
      "Connect a GitHub repository to display source control metadata for this project.",
    repositoryNoteTitle: "Repository management enabled",
    repositoryNote:
      "Hosts can connect or update the GitHub repository attached to this project.",
    membersEyebrow: "Team Management",
    membersTitle: "Project Members",
    inviteNoteTitle: "Member invitations enabled",
    inviteNote:
      "Hosts can invite collaborators and viewers into this project workspace.",
    activityTitle: "Project Timeline",
    activityEmpty:
      "Project timeline events will appear here as collaboration activity is recorded.",
  },
  collaborator: {
    label: "Collaborator",
    accessLabel: "Contributor access",
    tone: "collaborator",
    heroEyebrow: "Collaborator Workspace",
    heroSubtitle:
      "You can review project details, repository context, members, and activity without management controls.",
    overviewTitle: "Collaborator project view",
    overviewSummary:
      "Collaborator access focuses on project context, contribution visibility, and activity review.",
    repositoryTitle: "Repository Reference",
    repositoryEmpty:
      "No repository is connected yet. Once an owner or host connects one, repository details will appear here.",
    repositoryNoteTitle: "Repository is read-only",
    repositoryNote:
      "Collaborators can view repository details, but only owners and hosts can connect or update repositories.",
    membersEyebrow: "Project Team",
    membersTitle: "Project Members",
    inviteNoteTitle: "Invitations unavailable",
    inviteNote:
      "Collaborators can view the project team, but only owners and hosts can invite members.",
    activityTitle: "Project Activity",
    activityEmpty:
      "Project activity will appear here once workspace events are recorded.",
  },
  viewer: {
    label: "Viewer",
    accessLabel: "Read-only access",
    tone: "viewer",
    heroEyebrow: "Read-only Workspace",
    heroSubtitle:
      "You can view project details, repository context, members, and activity without editing project data.",
    overviewTitle: "Read-only project overview",
    overviewSummary:
      "Viewer access is designed for observing project status and activity without workspace management actions.",
    repositoryTitle: "Repository Reference",
    repositoryEmpty:
      "No repository is connected yet. Repository details will appear here after an owner or host connects one.",
    repositoryNoteTitle: "Read-only repository access",
    repositoryNote:
      "Viewers can review repository details, but cannot connect or update repositories.",
    membersEyebrow: "Project Team",
    membersTitle: "Project Members",
    inviteNoteTitle: "Read-only member access",
    inviteNote:
      "Viewers can review project members, but cannot invite or manage members.",
    activityTitle: "Project Activity",
    activityEmpty:
      "Project activity will appear here once workspace events are recorded.",
  },
  member: {
    label: "Member",
    accessLabel: "Project access",
    tone: "member",
    heroEyebrow: "Project Workspace",
    heroSubtitle:
      "You can review the project workspace available to your SkillForge account.",
    overviewTitle: "Project Details",
    overviewSummary:
      "Your project access is connected to this authenticated SkillForge account.",
    repositoryTitle: "Repository Reference",
    repositoryEmpty:
      "No repository is connected yet. Repository details will appear here when available.",
    repositoryNoteTitle: "Repository management unavailable",
    repositoryNote:
      "Repository management is limited to project owners and hosts.",
    membersEyebrow: "Project Team",
    membersTitle: "Project Members",
    inviteNoteTitle: "Invitations unavailable",
    inviteNote:
      "Member invitation controls are limited to project owners and hosts.",
    activityTitle: "Project Activity",
    activityEmpty:
      "Project activity will appear here once workspace events are recorded.",
  },
};

function getProjectRoleDetails(role = "") {
  const normalizedRole = role.toLowerCase();

  return projectRoleDetails[normalizedRole] || projectRoleDetails.member;
}

function ProjectDetail() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [activityEvents, setActivityEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [projectSettingsForm, setProjectSettingsForm] = useState({
    name: "",
    description: "",
    status: "active",
    visibility: "private",
  });
  const [projectSettingsError, setProjectSettingsError] = useState("");
  const [projectSettingsMessage, setProjectSettingsMessage] = useState("");
  const [projectSettingsFieldErrors, setProjectSettingsFieldErrors] = useState(
    {},
  );

  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [lifecycleError, setLifecycleError] = useState("");
  const [lifecycleMessage, setLifecycleMessage] = useState("");
  const [isArchivingProject, setIsArchivingProject] = useState(false);

  const [repositoryUrlInput, setRepositoryUrlInput] = useState("");
  const [repositoryError, setRepositoryError] = useState("");
  const [repositoryMessage, setRepositoryMessage] = useState("");
  const [isConnectingRepository, setIsConnectingRepository] = useState(false);

  const [inviteEmailInput, setInviteEmailInput] = useState("");
  const [inviteRoleInput, setInviteRoleInput] = useState("collaborator");
  const [inviteError, setInviteError] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isInvitingMember, setIsInvitingMember] = useState(false);

  const { token, authToken, jwt } = useAuth();

  const accessToken =
    token ||
    authToken ||
    jwt ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("skillforgeToken");

  useEffect(() => {
    let isMounted = true;

    async function loadProjectDetail() {
      try {
        setIsLoading(true);
        setError("");

        const [projectResponse, activityResponse, membersResponse] =
          await Promise.all([
            getProjectById({ token: accessToken, projectId }),
            getProjectActivity({ token: accessToken, projectId }),
            getProjectMembers({ token: accessToken, projectId }),
          ]);

        if (!isMounted) {
          return;
        }

        setProject(projectResponse.project);
        setActivityEvents(activityResponse.activityEvents || []);
        setMembers(membersResponse.members || []);
      } catch (requestError) {
        console.error("Project detail load error:", requestError);

        if (isMounted) {
          setError(
            requestError.message || "Unable to load this project right now.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (accessToken && projectId) {
      loadProjectDetail();
    } else {
      setIsLoading(false);
      setError("You must be signed in to view this project.");
    }

    return () => {
      isMounted = false;
    };
  }, [projectId, accessToken]);

  useEffect(() => {
    if (!project) {
      return;
    }

    setProjectSettingsForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "active",
      visibility: project.visibility || "private",
    });
  }, [project]);

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatActivityType = (eventType = "") => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatMemberLabel = (value = "") => {
    if (!value) {
      return "Not available";
    }

    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatRepositoryName = (repository) => {
    if (!repository?.owner || !repository?.name) {
      return "No repository connected";
    }

    return `${repository.owner}/${repository.name}`;
  };

  const getActivitySummary = (event) => {
    if (event.eventType === "member_invited") {
      return `${event.metadata?.invitedFullName || event.metadata?.invitedEmail || "A member"} was invited as ${formatMemberLabel(event.metadata?.role)}.`;
    }

    if (event.eventType === "member_invitation_accepted") {
      return `A project invitation was accepted for the ${formatMemberLabel(event.metadata?.role)} role.`;
    }

    if (event.eventType === "member_invitation_declined") {
      return `A project invitation was declined for the ${formatMemberLabel(event.metadata?.role)} role.`;
    }

    if (event.eventType === "repository_connected") {
      return event.metadata?.name && event.metadata?.owner
        ? `${event.metadata.owner}/${event.metadata.name} repository activity was recorded.`
        : "Repository activity was recorded.";
    }

    if (event.eventType === "project_archived") {
      return "Project was archived by the owner.";
    }

    if (event.eventType === "project_updated") {
      const currentName = event.metadata?.current?.name;

      return currentName
        ? `${currentName} project settings were updated.`
        : "Project settings were updated.";
    }

    if (event.eventType === "project_created") {
      return event.metadata?.projectName
        ? `${event.metadata.projectName} workspace activity was recorded.`
        : "Project workspace activity was recorded.";
    }

    return "A project activity event was recorded.";
  };

  const handleProjectSettingsChange = (event) => {
    const { name, value } = event.target;

    setProjectSettingsForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleProjectSettingsSubmit = async (event) => {
    event.preventDefault();

    const normalizedName = projectSettingsForm.name.trim();

    if (!normalizedName) {
      setProjectSettingsError("Project name is required.");
      setProjectSettingsFieldErrors({
        name: "Project name is required.",
      });

      return;
    }

    setProjectSettingsError("");
    setProjectSettingsMessage("");
    setProjectSettingsFieldErrors({});

    try {
      setIsUpdatingProject(true);

      const projectResponse = await updateProject({
        token: accessToken,
        projectId,
        name: normalizedName,
        description: projectSettingsForm.description,
        status: projectSettingsForm.status,
        visibility: projectSettingsForm.visibility,
      });

      setProject(projectResponse.project);

      setProjectSettingsForm({
        name: projectResponse.project.name || "",
        description: projectResponse.project.description || "",
        status: projectResponse.project.status || "active",
        visibility: projectResponse.project.visibility || "private",
      });

      if (projectResponse.activityEvent) {
        setActivityEvents((currentEvents) => [
          projectResponse.activityEvent,
          ...currentEvents,
        ]);
      }

      setProjectSettingsMessage("Project settings updated successfully.");
    } catch (requestError) {
      console.error("Project settings update error:", requestError);

      const fieldErrors = requestError.fields || {};
      const fieldError =
        fieldErrors.name ||
        fieldErrors.description ||
        fieldErrors.status ||
        fieldErrors.visibility;

      setProjectSettingsFieldErrors(fieldErrors);
      setProjectSettingsError(
        fieldError ||
          requestError.message ||
          "Unable to update project settings right now.",
      );
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const handleArchiveProject = async () => {
    const confirmedArchive = window.confirm(
      "Archive this project? Archived projects stay available for review, but active collaboration controls should no longer be used.",
    );

    if (!confirmedArchive) {
      return;
    }

    setLifecycleError("");
    setLifecycleMessage("");

    try {
      setIsArchivingProject(true);

      const archiveResponse = await archiveProject({
        token: accessToken,
        projectId,
      });

      setProject(archiveResponse.project);

      setProjectSettingsForm({
        name: archiveResponse.project.name || "",
        description: archiveResponse.project.description || "",
        status: archiveResponse.project.status || "archived",
        visibility: archiveResponse.project.visibility || "private",
      });

      if (archiveResponse.activityEvent) {
        setActivityEvents((currentEvents) => [
          archiveResponse.activityEvent,
          ...currentEvents,
        ]);
      }

      setLifecycleMessage("Project archived successfully.");
    } catch (requestError) {
      console.error("Project archive error:", requestError);

      setLifecycleError(
        requestError.message || "Unable to archive this project right now.",
      );
    } finally {
      setIsArchivingProject(false);
    }
  };

  const handleRepositorySubmit = async (event) => {
    event.preventDefault();

    setRepositoryError("");
    setRepositoryMessage("");

    try {
      setIsConnectingRepository(true);

      const repositoryResponse = await connectProjectRepository({
        token: accessToken,
        projectId,
        repositoryUrl: repositoryUrlInput,
      });

      setProject(repositoryResponse.project);
      setRepositoryUrlInput("");
      setRepositoryMessage("Repository connected successfully.");

      if (repositoryResponse.activityEvent) {
        setActivityEvents((currentEvents) => [
          repositoryResponse.activityEvent,
          ...currentEvents,
        ]);
      }
    } catch (requestError) {
      console.error("Repository connection error:", requestError);

      const fieldError = requestError.fields?.repositoryUrl;

      setRepositoryError(
        fieldError ||
          requestError.message ||
          "Unable to connect this repository right now.",
      );
    } finally {
      setIsConnectingRepository(false);
    }
  };

  const handleInviteSubmit = async (event) => {
    event.preventDefault();

    setInviteError("");
    setInviteMessage("");

    try {
      setIsInvitingMember(true);

      const inviteResponse = await inviteProjectMember({
        token: accessToken,
        projectId,
        email: inviteEmailInput,
        role: inviteRoleInput,
      });

      setMembers((currentMembers) => {
        const filteredMembers = currentMembers.filter((member) => {
          return member.userId !== inviteResponse.member.userId;
        });

        return [...filteredMembers, inviteResponse.member];
      });

      if (inviteResponse.activityEvent) {
        setActivityEvents((currentEvents) => [
          inviteResponse.activityEvent,
          ...currentEvents,
        ]);
      }

      setInviteEmailInput("");
      setInviteRoleInput("collaborator");
      setInviteMessage("Member invited successfully.");
    } catch (requestError) {
      console.error("Project member invite error:", requestError);

      const fieldError =
        requestError.fields?.email || requestError.fields?.role;

      setInviteError(
        fieldError ||
          requestError.message ||
          "Unable to invite this member right now.",
      );
    } finally {
      setIsInvitingMember(false);
    }
  };

  const projectRole = project?.role || project?.membership?.role || "member";
  const normalizedProjectRole = projectRole.toLowerCase();
  const roleDetails = getProjectRoleDetails(normalizedProjectRole);
  const repository = project?.repository || {};
  const repositoryUrl =
    project?.repositoryUrl || project?.repository?.url || "";

  const canManageProject = ["owner", "host"].includes(normalizedProjectRole);
  const canArchiveProject = normalizedProjectRole === "owner";
  const canConnectRepository = canManageProject;
  const canInviteMembers = canManageProject;
  const isProjectArchived = project?.status === "archived";

  if (isLoading) {
    return (
      <section className="project-detail">
        <div className="project-detail__state-card">
          <p className="project-detail__eyebrow">Project Detail</p>
          <h1 className="project-detail__title">Loading project...</h1>
          <p className="project-detail__text">
            Fetching project overview, access level, and activity history.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="project-detail">
        <div className="project-detail__state-card project-detail__state-card_type_error">
          <p className="project-detail__eyebrow">Project Detail</p>
          <h1 className="project-detail__title">Project unavailable</h1>
          <p className="project-detail__text">{error}</p>

          <Link className="project-detail__back-link" to="/projects">
            Back to Projects
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={`project-detail project-detail--${roleDetails.tone}`}>
      <div className="project-detail__hero">
        <div>
          <Link className="project-detail__back-link" to="/projects">
            Back to Projects
          </Link>

          <p className="project-detail__eyebrow">{roleDetails.heroEyebrow}</p>

          <h1 className="project-detail__title">{project.name}</h1>

          <p className="project-detail__subtitle">{roleDetails.heroSubtitle}</p>
        </div>

        <div className="project-detail__hero-aside">
          <div className="project-detail__status-card status-light status-light--hero">
            <div className="status-light__content">
              <span className="project-detail__status-label status-light__label">
                Status
              </span>
              <strong className="project-detail__status-value status-light__value">
                {project.status || "Active"}
              </strong>
            </div>
          </div>

          <div className="project-detail__access-card">
            <span className="project-detail__access-label">Access</span>
            <strong className="project-detail__access-value">
              {roleDetails.label}
            </strong>
            <span className="project-detail__access-detail">
              {roleDetails.accessLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="project-detail__grid">
        <article className="project-detail__panel">
          <div className="project-detail__panel-header">
            <p className="project-detail__eyebrow">Overview</p>
            <h2 className="project-detail__panel-title">
              {roleDetails.overviewTitle}
            </h2>
          </div>

          <dl className="project-detail__details-list">
            <div>
              <dt>Project ID</dt>
              <dd>{project.id || project._id || projectId}</dd>
            </div>

            <div>
              <dt>Role</dt>
              <dd>{roleDetails.label}</dd>
            </div>

            <div>
              <dt>Access</dt>
              <dd>{roleDetails.accessLabel}</dd>
            </div>

            <div>
              <dt>Created</dt>
              <dd>{formatDateTime(project.createdAt)}</dd>
            </div>

            <div>
              <dt>Updated</dt>
              <dd>{formatDateTime(project.updatedAt)}</dd>
            </div>
          </dl>

          <div className="project-detail__role-summary">
            <strong>{roleDetails.accessLabel}</strong>
            <p>{roleDetails.overviewSummary}</p>
          </div>
        </article>

        <article className="project-detail__panel">
          <div className="project-detail__panel-header">
            <p className="project-detail__eyebrow">Repository</p>
            <h2 className="project-detail__panel-title">
              {roleDetails.repositoryTitle}
            </h2>
          </div>

          <div className="project-detail__repository-card">
            <div className="project-detail__repository-header">
              <div>
                <p className="project-detail__repository-label">
                  Connected Repository
                </p>

                <h3 className="project-detail__repository-name">
                  {formatRepositoryName(repository)}
                </h3>
              </div>

              <span
                className={`project-detail__repository-badge ${
                  repositoryUrl
                    ? "project-detail__repository-badge_type_connected"
                    : ""
                }`}
              >
                {repositoryUrl ? "Connected" : "Not connected"}
              </span>
            </div>

            {repositoryUrl ? (
              <dl className="project-detail__repository-meta">
                <div>
                  <dt>Provider</dt>
                  <dd>{repository.provider || "github"}</dd>
                </div>

                <div>
                  <dt>Default Branch</dt>
                  <dd>{repository.defaultBranch || "Not available"}</dd>
                </div>

                <div>
                  <dt>GitHub Updated</dt>
                  <dd>{formatDateTime(repository.repositoryUpdatedAt)}</dd>
                </div>

                <div>
                  <dt>Last Synced</dt>
                  <dd>{formatDateTime(repository.syncedAt)}</dd>
                </div>
              </dl>
            ) : (
              <p className="project-detail__repository-empty">
                {roleDetails.repositoryEmpty}
              </p>
            )}

            {repositoryUrl && (
              <a
                className="project-detail__repository-link"
                href={repositoryUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open repository
              </a>
            )}
          </div>

          {canConnectRepository ? (
            <>
              <div className="project-detail__repository-note project-detail__repository-note_type_enabled">
                <strong>{roleDetails.repositoryNoteTitle}</strong>
                <span>{roleDetails.repositoryNote}</span>
              </div>

              <form
                className="project-detail__repository-form"
                onSubmit={handleRepositorySubmit}
              >
                <label htmlFor="repositoryUrl">
                  GitHub repository URL
                  <input
                    id="repositoryUrl"
                    name="repositoryUrl"
                    type="url"
                    placeholder="https://github.com/FHobbs8030/skillforge"
                    value={repositoryUrlInput}
                    onChange={(event) =>
                      setRepositoryUrlInput(event.target.value)
                    }
                    disabled={isConnectingRepository}
                  />
                </label>

                {repositoryError && (
                  <p className="project-detail__repository-error">
                    {repositoryError}
                  </p>
                )}

                {repositoryMessage && (
                  <p className="project-detail__repository-success">
                    {repositoryMessage}
                  </p>
                )}

                <button
                  className="project-detail__repository-button"
                  type="submit"
                  disabled={isConnectingRepository}
                >
                  {isConnectingRepository
                    ? "Connecting..."
                    : repositoryUrl
                      ? "Update Repository"
                      : "Connect Repository"}
                </button>
              </form>
            </>
          ) : (
            <div className="project-detail__repository-note">
              <strong>{roleDetails.repositoryNoteTitle}</strong>
              <span>{roleDetails.repositoryNote}</span>
            </div>
          )}
        </article>

        <article className="project-detail__panel project-detail__panel_type_settings">
          <div className="project-detail__panel-header">
            <p className="project-detail__eyebrow">Project Settings</p>
            <h2 className="project-detail__panel-title">
              Workspace configuration
            </h2>
          </div>

          {canManageProject ? (
            <>
              <div className="project-detail__settings-note project-detail__settings-note_type_enabled">
                <strong>Project settings enabled</strong>
                <span>
                  Owners and hosts can edit the project name, description,
                  status, and visibility.
                </span>
              </div>

              <form
                className="project-detail__settings-form"
                onSubmit={handleProjectSettingsSubmit}
              >
                <div className="project-detail__settings-fields">
                  <label htmlFor="projectSettingsName">
                    Project name
                    <input
                      id="projectSettingsName"
                      name="name"
                      type="text"
                      value={projectSettingsForm.name}
                      onChange={handleProjectSettingsChange}
                      disabled={isUpdatingProject}
                      aria-invalid={Boolean(projectSettingsFieldErrors.name)}
                    />
                  </label>

                  <label htmlFor="projectSettingsStatus">
                    Status
                    <select
                      id="projectSettingsStatus"
                      name="status"
                      value={projectSettingsForm.status}
                      onChange={handleProjectSettingsChange}
                      disabled={isUpdatingProject}
                      aria-invalid={Boolean(projectSettingsFieldErrors.status)}
                    >
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                      {projectSettingsForm.status === "archived" && (
                        <option value="archived" disabled>
                          Archived
                        </option>
                      )}
                    </select>
                  </label>

                  <label htmlFor="projectSettingsVisibility">
                    Visibility
                    <select
                      id="projectSettingsVisibility"
                      name="visibility"
                      value={projectSettingsForm.visibility}
                      onChange={handleProjectSettingsChange}
                      disabled={isUpdatingProject}
                      aria-invalid={Boolean(
                        projectSettingsFieldErrors.visibility,
                      )}
                    >
                      <option value="private">Private</option>
                      <option value="team">Team</option>
                      <option value="public">Public</option>
                    </select>
                  </label>
                </div>

                <label
                  className="project-detail__settings-description"
                  htmlFor="projectSettingsDescription"
                >
                  Description
                  <textarea
                    id="projectSettingsDescription"
                    name="description"
                    value={projectSettingsForm.description}
                    onChange={handleProjectSettingsChange}
                    disabled={isUpdatingProject}
                    placeholder="Describe the project workspace, goal, or collaboration context."
                    aria-invalid={Boolean(
                      projectSettingsFieldErrors.description,
                    )}
                  />
                </label>

                {projectSettingsError && (
                  <p className="project-detail__settings-error">
                    {projectSettingsError}
                  </p>
                )}

                {projectSettingsMessage && (
                  <p className="project-detail__settings-success">
                    {projectSettingsMessage}
                  </p>
                )}

                <div className="project-detail__settings-actions">
                  <button
                    className="project-detail__settings-button"
                    type="submit"
                    disabled={isUpdatingProject}
                  >
                    {isUpdatingProject
                      ? "Saving settings..."
                      : "Save Project Settings"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="project-detail__settings-note">
              <strong>Project settings are read-only</strong>
              <span>
                Your role can review project settings, but only owners and hosts
                can edit this workspace.
              </span>
            </div>
          )}
        </article>

        <article className="project-detail__panel project-detail__panel_type_lifecycle">
          <div className="project-detail__panel-header">
            <p className="project-detail__eyebrow">Lifecycle Controls</p>
            <h2 className="project-detail__panel-title">Archive project</h2>
          </div>

          {canArchiveProject ? (
            <div className="project-detail__lifecycle-card">
              <div>
                <h3>Owner-only archive control</h3>
                <p>
                  Archive this project when active collaboration is complete.
                  The project will remain available for review, timeline
                  history, and project records.
                </p>
              </div>

              {lifecycleError && (
                <p className="project-detail__lifecycle-error">
                  {lifecycleError}
                </p>
              )}

              {lifecycleMessage && (
                <p className="project-detail__lifecycle-success">
                  {lifecycleMessage}
                </p>
              )}

              <button
                className="project-detail__lifecycle-button"
                type="button"
                onClick={handleArchiveProject}
                disabled={isArchivingProject || isProjectArchived}
              >
                {isProjectArchived
                  ? "Project Archived"
                  : isArchivingProject
                    ? "Archiving..."
                    : "Archive Project"}
              </button>
            </div>
          ) : (
            <div className="project-detail__lifecycle-note">
              <strong>Lifecycle controls are owner-only</strong>
              <span>
                Your role can review project lifecycle status, but only project
                owners can archive this workspace.
              </span>
            </div>
          )}
        </article>

        <article className="project-detail__panel project-detail__panel_type_members">
          <div className="project-detail__panel-header project-detail__panel-header_type_split">
            <div>
              <p className="project-detail__eyebrow">
                {roleDetails.membersEyebrow}
              </p>
              <h2 className="project-detail__panel-title">
                {roleDetails.membersTitle}
              </h2>
            </div>

            <span className="project-detail__member-count">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>

          {canInviteMembers ? (
            <>
              <div className="project-detail__invite-note project-detail__invite-note_type_enabled">
                <strong>{roleDetails.inviteNoteTitle}</strong>
                <span>{roleDetails.inviteNote}</span>
              </div>

              <form
                className="project-detail__invite-form"
                onSubmit={handleInviteSubmit}
              >
                <div className="project-detail__invite-fields">
                  <label htmlFor="inviteEmail">
                    Member email
                    <input
                      id="inviteEmail"
                      name="inviteEmail"
                      type="email"
                      placeholder="member@example.com"
                      value={inviteEmailInput}
                      onChange={(event) =>
                        setInviteEmailInput(event.target.value)
                      }
                      disabled={isInvitingMember}
                    />
                  </label>

                  <label htmlFor="inviteRole">
                    Role
                    <select
                      id="inviteRole"
                      name="inviteRole"
                      value={inviteRoleInput}
                      onChange={(event) =>
                        setInviteRoleInput(event.target.value)
                      }
                      disabled={isInvitingMember}
                    >
                      <option value="collaborator">Collaborator</option>
                      <option value="host">Host</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </label>
                </div>

                {inviteError && (
                  <p className="project-detail__invite-error">{inviteError}</p>
                )}

                {inviteMessage && (
                  <p className="project-detail__invite-success">
                    {inviteMessage}
                  </p>
                )}

                <button
                  className="project-detail__invite-button"
                  type="submit"
                  disabled={isInvitingMember}
                >
                  {isInvitingMember ? "Inviting..." : "Invite Member"}
                </button>
              </form>
            </>
          ) : (
            <div className="project-detail__invite-note">
              <strong>{roleDetails.inviteNoteTitle}</strong>
              <span>{roleDetails.inviteNote}</span>
            </div>
          )}

          {members.length > 0 ? (
            <div className="project-detail__members-list">
              {members.map((member) => {
                const memberAvatarUrl = getUserAvatarUrl(member);
                const memberInitials = getUserInitials(member);
                const memberName =
                  member.fullName || "Unknown member";

                return (
                  <article
                    className="project-detail__member-card"
                    key={member.id || member.userId}
                  >
                    {memberAvatarUrl ? (
                      <img
                        className="project-detail__member-avatar"
                        src={memberAvatarUrl}
                        alt={`${memberName} avatar`}
                        loading="lazy"
                      />
                    ) : (
                      <span
                        className="project-detail__member-avatar project-detail__member-avatar--fallback"
                        aria-hidden="true"
                      >
                        {memberInitials}
                      </span>
                    )}

                    <div className="project-detail__member-main">
                      <div className="project-detail__member-heading">
                        <div>
                          <h3>{memberName}</h3>

                          <p>
                            {member.email || "Email not available"}
                          </p>
                        </div>

                        <div className="project-detail__member-badges">
                          <span className="project-detail__member-badge project-detail__member-badge_type_role">
                            {formatMemberLabel(member.role)}
                          </span>

                          <span className="project-detail__member-badge project-detail__member-badge_type_status">
                            {formatMemberLabel(member.status)}
                          </span>
                        </div>
                      </div>

                      <dl className="project-detail__member-meta">
                        <div>
                          <dt>Joined</dt>
                          <dd>{formatDateTime(member.joinedAt)}</dd>
                        </div>

                        <div>
                          <dt>Account</dt>
                          <dd>
                            {formatMemberLabel(
                              member.accountMembership,
                            )}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="project-detail__empty-state">
              <h3>No members found</h3>
              <p>
                Project collaborators will appear here once members are attached
                to this workspace.
              </p>
            </div>
          )}
        </article>

        <article className="project-detail__panel project-detail__panel_type_timeline">
          <div className="project-detail__panel-header">
            <p className="project-detail__eyebrow">Activity</p>
            <h2 className="project-detail__panel-title">
              {roleDetails.activityTitle}
            </h2>
          </div>

          {activityEvents.length > 0 ? (
            <ul className="project-detail__timeline">
              {activityEvents.map((event) => (
                <li
                  className="project-detail__timeline-item"
                  key={event._id || event.id}
                >
                  <div className="project-detail__timeline-marker" />

                  <div>
                    <h3>{formatActivityType(event.eventType)}</h3>

                    <p>{getActivitySummary(event)}</p>
                    <time>{formatDateTime(event.occurredAt)}</time>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="project-detail__empty-state">
              <h3>No activity yet</h3>
              <p>{roleDetails.activityEmpty}</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default ProjectDetail;
