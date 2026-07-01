import ProjectOverviewWidget from "../../components/host/ProjectOverviewWidget/ProjectOverviewWidget";
import CreateWorkSectionWidget from "../../components/host/CreateWorkSectionWidget/CreateWorkSectionWidget";
import SectionSummaryWidget from "../../components/host/SectionSummaryWidget/SectionSummaryWidget";
import TeamLocalTimesWidget from "../../components/host/TeamLocalTimesWidget/TeamLocalTimesWidget";

import {
  mockHostProject,
  mockHostSectionSummary,
} from "../../data/mockHostData";

import { mockCollaborators } from "../../data/mockCollaboratorData";

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
        <div
          className="host-dashboard__project-setup host-dashboard__section-anchor"
          id="project-setup"
        >
          <ProjectOverviewWidget project={mockHostProject} />

          <CreateWorkSectionWidget />
        </div>

        <div
          className="host-dashboard__section-anchor host-dashboard__section-summary"
          id="section-summary"
        >
          <SectionSummaryWidget summary={mockHostSectionSummary} />
        </div>

        <div
          className="host-dashboard__section-anchor host-dashboard__team-local-times"
          id="team-local-times"
        >
          <TeamLocalTimesWidget collaborators={mockCollaborators} />
        </div>
      </div>
    </section>
  );
}

export default HostDashboard;
