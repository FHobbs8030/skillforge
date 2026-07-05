import "./ProjectOverviewWidget.css";

function ProjectOverviewWidget({ project }) {
  return (
    <article className="project-overview-widget">
      <header className="project-overview-widget__header">
        <div>
          <p className="project-overview-widget__eyebrow">Project Overview</p>

          <h2 className="project-overview-widget__title">{project.name}</h2>
        </div>

        <span className="project-overview-widget__status">
          {project.status}
        </span>
      </header>

      <p className="project-overview-widget__description">
        {project.description}
      </p>

      <div className="project-overview-widget__repository">
        <span className="project-overview-widget__label">
          Connected Repository
        </span>

        <strong>{project.repository}</strong>
      </div>

      <div className="project-overview-widget__goal">
        <span className="project-overview-widget__label">
          Current Project Goal
        </span>

        <p>{project.goal}</p>
      </div>

      <footer className="project-overview-widget__footer">
        <div className="project-overview-widget__metric">
          <strong>{project.collaboratorCount}</strong>
          <span>Collaborators</span>
        </div>

        <div className="project-overview-widget__metric">
          <strong>{project.sectionCount}</strong>
          <span>Work Sections</span>
        </div>

        <span className="project-overview-widget__updated">
          {project.updatedLabel}
        </span>
      </footer>
    </article>
  );
}

export default ProjectOverviewWidget;
