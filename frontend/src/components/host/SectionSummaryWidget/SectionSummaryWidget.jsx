import "./SectionSummaryWidget.css";

function SectionSummaryWidget({ summary }) {
  const statuses = summary?.statuses ?? [];

  const totalSections = statuses.reduce(
    (total, status) => total + status.count,
    0,
  );

  const availableSections =
    statuses.find((status) => status.id === "available")?.count ?? 0;

  const completedSections =
    statuses.find((status) => status.id === "completed")?.count ?? 0;

  const completionRate =
    totalSections > 0
      ? Math.round((completedSections / totalSections) * 100)
      : 0;

  const progressLabel = statuses
    .map((status) => `${status.label}: ${status.count}`)
    .join(", ");

  return (
    <article className="section-summary-widget">
      <header className="section-summary-widget__header">
        <div>
          <p className="section-summary-widget__eyebrow">Work Distribution</p>

          <h2 className="section-summary-widget__title">Section Summary</h2>
        </div>

        <span className="section-summary-widget__badge">
          {totalSections} Sections
        </span>
      </header>

      <p className="section-summary-widget__description">
        Monitor how project sections are distributed across the collaboration
        workflow.
      </p>

      <div className="section-summary-widget__progress">
        <div className="section-summary-widget__progress-header">
          <span>Section allocation</span>

          <strong>{completionRate}% complete</strong>
        </div>

        <div
          className="section-summary-widget__progress-track"
          role="img"
          aria-label={progressLabel}
        >
          {statuses
            .filter((status) => status.count > 0)
            .map((status) => (
              <span
                key={status.id}
                className={`section-summary-widget__progress-segment section-summary-widget__progress-segment--${status.id}`}
                style={{ flexGrow: status.count }}
                title={`${status.label}: ${status.count}`}
                aria-hidden="true"
              />
            ))}
        </div>
      </div>

      <div className="section-summary-widget__statuses">
        {statuses.map((status) => (
          <div
            key={status.id}
            className={`section-summary-widget__status section-summary-widget__status--${status.id}`}
          >
            <div className="section-summary-widget__status-heading">
              <span
                className="section-summary-widget__status-dot"
                aria-hidden="true"
              />

              <span>{status.label}</span>
            </div>

            <strong>{status.count}</strong>
          </div>
        ))}
      </div>

      <footer className="section-summary-widget__footer">
        <span>
          <strong>{availableSections}</strong>{" "}
          {availableSections === 1 ? "section is" : "sections are"} available
          for collaborators to claim.
        </span>

        <span>{summary.updatedLabel}</span>
      </footer>
    </article>
  );
}

export default SectionSummaryWidget;
