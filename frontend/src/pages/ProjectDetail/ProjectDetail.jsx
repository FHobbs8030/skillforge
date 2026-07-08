import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import "./ProjectDetail.css";

import { getProjectActivity, getProjectById } from "../../utils/api";
import useAuth from "../../contexts/useAuth";

function ProjectDetail() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [activityEvents, setActivityEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

        const [projectResponse, activityResponse] = await Promise.all([
          getProjectById({ token: accessToken, projectId }),
          getProjectActivity({ token: accessToken, projectId }),
        ]);

        if (!isMounted) {
          return;
        }

        setProject(projectResponse.project);
        setActivityEvents(activityResponse.activityEvents || []);
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

  const projectRole = project?.role || project?.membership?.role || "Member";
  const repositoryUrl =
    project?.repositoryUrl || project?.repository?.url || "";

  if (isLoading) {
    return (
      <section className="project-detail">
        <div className="project-detail__state-card">
          <p className="project-detail__eyebrow">Project Detail</p>
          <h1 className="project-detail__title">Loading project...</h1>
          <p className="project-detail__text">
            Fetching project overview and activity history.
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
    <section className="project-detail">
      <div className="project-detail__hero">
        <div>
          <Link className="project-detail__back-link" to="/projects">
            Back to Projects
          </Link>

          <p className="project-detail__eyebrow">Project Workspace</p>

          <h1 className="project-detail__title">{project.name}</h1>

          <p className="project-detail__subtitle">
            Dedicated project overview, membership role, repository reference,
            and activity timeline.
          </p>
        </div>

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
      </div>

      <div className="project-detail__grid">
        <article className="project-detail__panel">
          <div className="project-detail__panel-header">
            <p className="project-detail__eyebrow">Overview</p>
            <h2 className="project-detail__panel-title">Project Details</h2>
          </div>

          <dl className="project-detail__details-list">
            <div>
              <dt>Project ID</dt>
              <dd>{project.id || project._id || projectId}</dd>
            </div>

            <div>
              <dt>Role</dt>
              <dd>{projectRole}</dd>
            </div>

            <div>
              <dt>Created</dt>
              <dd>{formatDateTime(project.createdAt)}</dd>
            </div>

            <div>
              <dt>Updated</dt>
              <dd>{formatDateTime(project.updatedAt)}</dd>
            </div>

            <div>
              <dt>Repository</dt>
              <dd>
                {repositoryUrl ? (
                  <a href={repositoryUrl} target="_blank" rel="noreferrer">
                    Open repository
                  </a>
                ) : (
                  "No repository connected yet"
                )}
              </dd>
            </div>
          </dl>
        </article>

        <article className="project-detail__panel">
          <div className="project-detail__panel-header">
            <p className="project-detail__eyebrow">Activity</p>
            <h2 className="project-detail__panel-title">Project Timeline</h2>
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

                    <p>
                      {event.metadata?.projectName
                        ? `${event.metadata.projectName} workspace activity was recorded.`
                        : "A project activity event was recorded."}
                    </p>

                    <time>{formatDateTime(event.occurredAt)}</time>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="project-detail__empty-state">
              <h3>No activity yet</h3>
              <p>
                Project timeline events will appear here as collaboration
                activity is recorded.
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default ProjectDetail;
