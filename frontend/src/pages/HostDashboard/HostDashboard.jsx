import ProjectOverviewWidget from "../../components/host/ProjectOverviewWidget/ProjectOverviewWidget";
import CreateWorkSectionWidget from "../../components/host/CreateWorkSectionWidget/CreateWorkSectionWidget";
import SectionSummaryWidget from "../../components/host/SectionSummaryWidget/SectionSummaryWidget";

import {
  mockHostProject,
  mockHostSectionSummary,
} from "../../data/mockHostData";

import "./HostDashboard.css";

function HostDashboard() {
  return (
    <section className="host-dashboard" aria-labelledby="host-dashboard-title">
      <header className="host-dashboard__header">
        <div>
          <p className="host-dashboard__eyebrow">Host Mode</p>

          <h1 className="host-dashboard__title" id="host-dashboard-title">
            Project Command Center
          </h1>

          <p className="host-dashboard__subtitle">
            Define project goals, organize work, and monitor collaborator
            progress.
          </p>
        </div>
      </header>

      <div className="host-dashboard__grid">
        <ProjectOverviewWidget project={mockHostProject} />

        <CreateWorkSectionWidget />

        <div className="host-dashboard__section-summary">
          <SectionSummaryWidget summary={mockHostSectionSummary} />
        </div>
      </div>
    </section>
  );
}

export default HostDashboard;
