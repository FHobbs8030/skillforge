import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useAuth from "../../contexts/useAuth";
import { getProjectActivity, getProjects } from "../../utils/api";

import "./ProjectHistory.css";

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

function normalizeActivityEvents(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.activityEvents)) {
    return response.activityEvents;
  }

  if (Array.isArray(response?.data?.activityEvents)) {
    return response.data.activityEvents;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
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
    "Project history is connected to the SkillForge backend and ready for activity tracking."
  );
}

function getProjectRole(project) {
  return (
    project?.role ||
    project?.memberRole ||
    project?.membershipRole ||
    project?.membership?.role ||
    project?.projectMembership?.role ||
    "Owner"
  );
}

function getProjectStatus(project) {
  return project?.status || "Active";
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) {
    return "Time pending";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time pending";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatProjectMeta(project) {
  const createdAt = formatDate(project?.createdAt);
  const updatedAt = formatDate(project?.updatedAt);

  if (createdAt === "Not available" && updatedAt === "Not available") {
    return "Timeline pending";
  }

  if (updatedAt !== "Not available") {
    return `Updated ${updatedAt}`;
  }

  return `Created ${createdAt}`;
}

function formatEventType(eventType) {
  if (!eventType) {
    return "Activity event";
  }

  return eventType
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCountLabel(
  count,
  singularLabel,
  pluralLabel = `${singularLabel}s`,
) {
  return `${count} ${count === 1 ? singularLabel : pluralLabel}`;
}

function getEventSummary(event) {
  if (event?.eventType === "project_created") {
    return "Project workspace was created and connected to your account.";
  }

  return "Project activity was recorded by SkillForge.";
}

function ProjectHistory() {
  const { token } = useAuth();

  const [projects, setProjects] = useState([]);
  const [activityByProjectId, setActivityByProjectId] = useState({});
  const [activityLoadingByProjectId, setActivityLoadingByProjectId] = useState(
    {},
  );
  const [activityErrorByProjectId, setActivityErrorByProjectId] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadProjects() {
      setIsLoading(true);
      setErrorMessage("");
      setActivityByProjectId({});
      setActivityLoadingByProjectId({});
      setActivityErrorByProjectId({});

      try {
        const response = await getProjects(token);
        const projectList = normalizeProjects(response);

        if (isActive) {
          setProjects(projectList);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error?.message ||
              "Project history could not be loaded. Please try again.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      isActive = false;
    };
  }, [token]);

  useEffect(() => {
    let isActive = true;

    async function loadProjectActivity() {
      const projectIds = projects.map(getProjectId).filter(Boolean);

      if (!token || projectIds.length === 0) {
        return;
      }

      setActivityLoadingByProjectId(
        Object.fromEntries(projectIds.map((projectId) => [projectId, true])),
      );
      setActivityErrorByProjectId({});

      const activityResults = await Promise.allSettled(
        projectIds.map(async (projectId) => {
          const response = await getProjectActivity({ token, projectId });

          return [projectId, normalizeActivityEvents(response)];
        }),
      );

      if (!isActive) {
        return;
      }

      const nextActivityByProjectId = {};
      const nextActivityErrorByProjectId = {};

      activityResults.forEach((result, index) => {
        const projectId = projectIds[index];

        if (result.status === "fulfilled") {
          const [resolvedProjectId, activityEvents] = result.value;

          nextActivityByProjectId[resolvedProjectId] = activityEvents;
        } else {
          nextActivityErrorByProjectId[projectId] =
            result.reason?.message ||
            "Activity history could not be loaded for this project.";
        }
      });

      setActivityByProjectId(nextActivityByProjectId);
      setActivityErrorByProjectId(nextActivityErrorByProjectId);
      setActivityLoadingByProjectId(
        Object.fromEntries(projectIds.map((projectId) => [projectId, false])),
      );
    }

    loadProjectActivity();

    return () => {
      isActive = false;
    };
  }, [projects, token]);

  const projectStats = useMemo(() => {
    const totalProjects = projects.length;

    const activeProjects = projects.filter(
      (project) => getProjectStatus(project).toLowerCase() === "active",
    ).length;

    const ownedProjects = projects.filter(
      (project) => getProjectRole(project).toLowerCase() === "owner",
    ).length;

    return {
      totalProjects,
      activeProjects,
      ownedProjects,
    };
  }, [projects]);

  const activityEventCount = useMemo(() => {
    return Object.values(activityByProjectId).reduce(
      (total, activityEvents) => total + activityEvents.length,
      0,
    );
  }, [activityByProjectId]);

  const hasProjects = projects.length > 0;

  return (
    <section
      className="project-history"
      aria-labelledby="project-history-title"
    >
      <header className="project-history__header">
        <div>
          <p className="project-history__eyebrow">Project History</p>

          <h1 className="project-history__title" id="project-history-title">
            Your SkillForge projects
          </h1>

          <p className="project-history__subtitle">
            Review the protected project records connected to your authenticated
            SkillForge account. This view now includes backend activity events
            for each project timeline.
          </p>
        </div>

        <Link className="project-history__dashboard-link" to="/app">
          Back to dashboard
        </Link>
      </header>

      <div
        className="project-history__metrics"
        aria-label="Project history overview"
      >
        <article className="project-history__metric project-history__metric--blue">
          <span className="project-history__metric-label">Projects</span>
          <strong className="project-history__metric-value">
            {projectStats.totalProjects}
          </strong>
          <span className="project-history__metric-detail">
            Available from backend
          </span>
        </article>

        <article className="project-history__metric project-history__metric--teal">
          <span className="project-history__metric-label">Active</span>
          <strong className="project-history__metric-value">
            {projectStats.activeProjects}
          </strong>
          <span className="project-history__metric-detail">
            Ready for tracking
          </span>
        </article>

        <article className="project-history__metric project-history__metric--purple">
          <span className="project-history__metric-label">Activity</span>
          <strong className="project-history__metric-value">
            {activityEventCount}
          </strong>
          <span className="project-history__metric-detail">
            Timeline events
          </span>
        </article>
      </div>

      <section
        className="project-history__panel"
        aria-labelledby="project-list-title"
      >
        <div className="project-history__panel-heading">
          <div>
            <p className="project-history__panel-eyebrow">
              Connected Workspace
            </p>

            <h2 id="project-list-title">Project list</h2>
          </div>

          {!isLoading && hasProjects && (
            <span className="project-history__count-badge">
              {formatCountLabel(projects.length, "project")} loaded
            </span>
          )}
        </div>

        {isLoading && (
          <div
            className="project-history__state"
            role="status"
            aria-live="polite"
          >
            Loading project history...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="project-history__state project-history__state--error">
            <h3>Project history unavailable</h3>

            <p>{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && !hasProjects && (
          <div className="project-history__state project-history__state--empty">
            <h3>No projects found</h3>

            <p>
              Your account is authenticated, but no project records were
              returned by the backend yet.
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && hasProjects && (
          <div className="project-history__list">
            {projects.map((project) => {
              const projectId = getProjectId(project);
              const activityEvents = activityByProjectId[projectId] || [];
              const isActivityLoading = Boolean(
                activityLoadingByProjectId[projectId],
              );
              const activityError = activityErrorByProjectId[projectId];

              return (
                <article
                  className="project-history__project-card"
                  key={projectId || getProjectName(project)}
                >
                  <div className="project-history__project-main">
                    <div>
                      <p className="project-history__project-label">Project</p>

                      <h3>{getProjectName(project)}</h3>

                      <p>{getProjectDescription(project)}</p>
                    </div>

                    <span className="project-history__status-badge">
                      {getProjectStatus(project)}
                    </span>
                  </div>

                  <dl className="project-history__project-meta">
                    <div>
                      <dt>Role</dt>
                      <dd>{getProjectRole(project)}</dd>
                    </div>

                    <div>
                      <dt>Created</dt>
                      <dd>{formatDate(project?.createdAt)}</dd>
                    </div>

                    <div>
                      <dt>Timeline</dt>
                      <dd>{formatProjectMeta(project)}</dd>
                    </div>

                    {projectId && (
                      <div>
                        <dt>Project ID</dt>
                        <dd>{projectId}</dd>
                      </div>
                    )}
                  </dl>

                  <section
                    className="project-history__activity"
                    aria-label={`${getProjectName(project)} activity history`}
                  >
                    <div className="project-history__activity-heading">
                      <div>
                        <p className="project-history__activity-label">
                          Activity History
                        </p>

                        <h4>Project timeline</h4>
                      </div>

                      <span className="project-history__activity-count">
                        {formatCountLabel(activityEvents.length, "event")}
                      </span>
                    </div>

                    {isActivityLoading && (
                      <div className="project-history__activity-state">
                        Loading activity events...
                      </div>
                    )}

                    {!isActivityLoading && activityError && (
                      <div className="project-history__activity-state project-history__activity-state--error">
                        {activityError}
                      </div>
                    )}

                    {!isActivityLoading &&
                      !activityError &&
                      activityEvents.length === 0 && (
                        <div className="project-history__activity-state">
                          No activity events recorded yet.
                        </div>
                      )}

                    {!isActivityLoading &&
                      !activityError &&
                      activityEvents.length > 0 && (
                        <ol className="project-history__activity-list">
                          {activityEvents.map((event) => (
                            <li
                              className="project-history__activity-item"
                              key={
                                event._id ||
                                `${event.eventType}-${event.occurredAt}`
                              }
                            >
                              <span
                                className="project-history__activity-marker"
                                aria-hidden="true"
                              />

                              <div className="project-history__activity-content">
                                <div className="project-history__activity-title-row">
                                  <strong>
                                    {formatEventType(event.eventType)}
                                  </strong>

                                  <time dateTime={event.occurredAt}>
                                    {formatDateTime(event.occurredAt)}
                                  </time>
                                </div>

                                <p>{getEventSummary(event)}</p>

                                <div className="project-history__activity-details">
                                  <span>{event.source || "skillforge"}</span>

                                  {event.entityType && (
                                    <span>{event.entityType}</span>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                  </section>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

export default ProjectHistory;
