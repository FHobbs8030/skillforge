import { mockCollaboratorDashboard } from "../../data/mockCollaboratorData";

import "./CollaboratorDashboard.css";

function CollaboratorDashboard() {
  const {
    collaborator,
    activeProject,
    summary,
    myWork,
    availableWork,
    communications,
  } = mockCollaboratorDashboard;

  return (
    <section
      className="collaborator-dashboard"
      aria-labelledby="collaborator-dashboard-title"
    >
      <header className="collaborator-dashboard__header">
        <div>
          <p className="collaborator-dashboard__eyebrow">
            Collaborator Workspace
          </p>

          <h1
            className="collaborator-dashboard__title"
            id="collaborator-dashboard-title"
          >
            My Project Workspace
          </h1>

          <p className="collaborator-dashboard__subtitle">
            Review your work, understand project expectations, communicate with
            the host, and raise questions or blockers before they delay
            progress.
          </p>
        </div>

        <div className="collaborator-dashboard__active-project">
          <span className="collaborator-dashboard__active-project-label">
            Active Project
          </span>

          <strong>{activeProject.name}</strong>

          <span className="collaborator-dashboard__active-project-status">
            {activeProject.status}
          </span>
        </div>
      </header>

      <div
        className="collaborator-dashboard__overview collaborator-dashboard__section-anchor"
        id="collaborator-overview"
      >
        <article className="collaborator-dashboard__panel collaborator-dashboard__project-card">
          <div className="collaborator-dashboard__panel-heading">
            <div>
              <p className="collaborator-dashboard__panel-eyebrow">
                Current Project
              </p>

              <h2>{activeProject.name}</h2>
            </div>

            <span className="collaborator-dashboard__status-badge collaborator-dashboard__status-badge--active">
              {activeProject.status}
            </span>
          </div>

          <p className="collaborator-dashboard__project-description">
            {activeProject.description}
          </p>

          <dl className="collaborator-dashboard__detail-list">
            <div>
              <dt>Project Host</dt>
              <dd>{activeProject.hostName}</dd>
            </div>

            <div>
              <dt>Next Team Check-In</dt>
              <dd>{activeProject.nextCheckIn}</dd>
            </div>

            <div>
              <dt>Current Priority</dt>
              <dd>{activeProject.nextPriority}</dd>
            </div>
          </dl>
        </article>

        <article className="collaborator-dashboard__panel collaborator-dashboard__profile-card">
          <div className="collaborator-dashboard__profile-heading">
            <div className="collaborator-dashboard__avatar" aria-hidden="true">
              {collaborator.initials}
            </div>

            <div>
              <p className="collaborator-dashboard__panel-eyebrow">
                Collaborator Profile
              </p>

              <h2>{collaborator.name}</h2>

              <p className="collaborator-dashboard__profile-role">
                {collaborator.role}
              </p>
            </div>
          </div>

          <dl className="collaborator-dashboard__profile-details">
            <div>
              <dt>Project Role</dt>
              <dd>{collaborator.membershipRole}</dd>
            </div>

            <div>
              <dt>Location</dt>
              <dd>{collaborator.location}</dd>
            </div>

            <div>
              <dt>Local Time Zone</dt>
              <dd>{collaborator.timeZoneLabel}</dd>
            </div>

            <div>
              <dt>GitHub</dt>
              <dd>@{collaborator.githubUsername}</dd>
            </div>
          </dl>
        </article>
      </div>

      <div
        className="collaborator-dashboard__metrics"
        aria-label="Collaborator work summary"
      >
        {summary.map((item) => (
          <article
            key={item.id}
            className={`collaborator-dashboard__metric collaborator-dashboard__metric--${item.tone}`}
          >
            <span className="collaborator-dashboard__metric-label">
              {item.label}
            </span>

            <strong className="collaborator-dashboard__metric-value">
              {item.value}
            </strong>

            <span className="collaborator-dashboard__metric-detail">
              {item.detail}
            </span>
          </article>
        ))}
      </div>

      <section
        className="collaborator-dashboard__work-section collaborator-dashboard__section-anchor"
        id="work-sections"
        aria-labelledby="work-sections-title"
      >
        <div className="collaborator-dashboard__section-heading">
          <div>
            <p className="collaborator-dashboard__panel-eyebrow">
              Work Sections
            </p>

            <h2 id="work-sections-title">Understand what you are working on</h2>

            <p>
              Assigned work and available work stay together so responsibilities
              remain clear.
            </p>
          </div>
        </div>

        <div className="collaborator-dashboard__work-grid">
          <article className="collaborator-dashboard__panel">
            <div className="collaborator-dashboard__list-heading">
              <div>
                <h3>My Work</h3>

                <p>{myWork.length} sections assigned to you</p>
              </div>

              <span className="collaborator-dashboard__count-badge">
                {myWork.length}
              </span>
            </div>

            <div className="collaborator-dashboard__work-list">
              {myWork.map((workItem) => (
                <article
                  key={workItem.id}
                  className={`collaborator-dashboard__work-item collaborator-dashboard__work-item--${workItem.status}`}
                >
                  <div className="collaborator-dashboard__work-item-heading">
                    <div>
                      <h4>{workItem.title}</h4>

                      <p>
                        {workItem.priority} priority · Due {workItem.dueDate}
                      </p>
                    </div>

                    <span
                      className={`collaborator-dashboard__status-badge collaborator-dashboard__status-badge--${workItem.status}`}
                    >
                      {workItem.statusLabel}
                    </span>
                  </div>

                  <div className="collaborator-dashboard__progress-row">
                    <div
                      className="collaborator-dashboard__progress-track"
                      role="progressbar"
                      aria-label={`${workItem.title} progress`}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow={workItem.progress}
                    >
                      <span
                        className="collaborator-dashboard__progress-fill"
                        style={{
                          width: `${workItem.progress}%`,
                        }}
                      />
                    </div>

                    <strong>{workItem.progress}%</strong>
                  </div>

                  <div className="collaborator-dashboard__host-note">
                    <span>Host guidance</span>

                    <p>{workItem.hostNote}</p>
                  </div>

                  <div className="collaborator-dashboard__criteria">
                    <span>Completion checklist</span>

                    <ul>
                      {workItem.acceptanceCriteria.map((criterion) => (
                        <li key={criterion}>{criterion}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="collaborator-dashboard__updated">
                    {workItem.updatedAt}
                  </p>
                </article>
              ))}
            </div>
          </article>

          <article className="collaborator-dashboard__panel">
            <div className="collaborator-dashboard__list-heading">
              <div>
                <h3>Available Work</h3>

                <p>Sections that are ready to be claimed</p>
              </div>

              <span className="collaborator-dashboard__count-badge">
                {availableWork.length}
              </span>
            </div>

            <div className="collaborator-dashboard__available-list">
              {availableWork.map((workItem) => (
                <article
                  key={workItem.id}
                  className="collaborator-dashboard__available-item"
                >
                  <div className="collaborator-dashboard__available-heading">
                    <h4>{workItem.title}</h4>

                    <span>{workItem.priority}</span>
                  </div>

                  <p>{workItem.description}</p>

                  <dl className="collaborator-dashboard__available-details">
                    <div>
                      <dt>Estimated Time</dt>
                      <dd>{workItem.estimatedHours}</dd>
                    </div>
                  </dl>

                  <div
                    className="collaborator-dashboard__skills"
                    aria-label={`Skills for ${workItem.title}`}
                  >
                    {workItem.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>

                  <p className="collaborator-dashboard__preview-note">
                    Claim controls will be connected during the work-section
                    workflow phase.
                  </p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section
        className="collaborator-dashboard__communication collaborator-dashboard__section-anchor"
        id="communication"
        aria-labelledby="communication-title"
      >
        <div className="collaborator-dashboard__section-heading">
          <div>
            <p className="collaborator-dashboard__panel-eyebrow">
              Communication Center
            </p>

            <h2 id="communication-title">
              Messages, feedback, questions, and blockers
            </h2>

            <p>
              Important communication remains attached to the project so
              everyone understands what needs attention.
            </p>
          </div>
        </div>

        <div className="collaborator-dashboard__communication-list">
          {communications.map((communication) => (
            <article
              key={communication.id}
              className={`collaborator-dashboard__communication-item collaborator-dashboard__communication-item--${communication.type}${
                communication.unread
                  ? " collaborator-dashboard__communication-item--unread"
                  : ""
              }`}
            >
              <div className="collaborator-dashboard__communication-heading">
                <div>
                  <span className="collaborator-dashboard__communication-category">
                    {communication.category}
                  </span>

                  <h3>{communication.title}</h3>
                </div>

                {communication.unread && (
                  <span className="collaborator-dashboard__unread-badge">
                    New
                  </span>
                )}
              </div>

              <p className="collaborator-dashboard__communication-body">
                {communication.body}
              </p>

              <div className="collaborator-dashboard__communication-meta">
                <span>From {communication.sender}</span>

                <span>{communication.time}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default CollaboratorDashboard;
