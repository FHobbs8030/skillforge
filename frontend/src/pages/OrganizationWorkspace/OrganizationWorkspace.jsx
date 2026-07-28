import { Link, useParams } from "react-router-dom";

import "./OrganizationWorkspace.css";

function OrganizationWorkspace() {
  const { organizationId } = useParams();

  return (
    <section
      className="organization-workspace"
      aria-labelledby="organization-workspace-title"
    >
      <header className="organization-workspace__header">
        <div>
          <p className="organization-workspace__eyebrow">
            Organization Workspace
          </p>

          <h1
            className="organization-workspace__title"
            id="organization-workspace-title"
          >
            Organization details
          </h1>

          <p className="organization-workspace__subtitle">
            This protected workspace is ready for organization profile,
            membership, activity, and role-management data.
          </p>
        </div>

        <Link
          className="organization-workspace__directory-link"
          to="/organizations"
        >
          All organizations
        </Link>
      </header>

      <div className="organization-workspace__identity">
        <span className="organization-workspace__identity-label">
          Organization ID
        </span>

        <code className="organization-workspace__identity-value">
          {organizationId}
        </code>
      </div>

      <div className="organization-workspace__grid">
        <article className="organization-workspace__panel">
          <p className="organization-workspace__panel-kicker">Members</p>

          <h2 className="organization-workspace__panel-title">
            Membership directory
          </h2>

          <p className="organization-workspace__panel-copy">
            Owner, Admin, Member, invited, and inactive membership states will
            be rendered here.
          </p>
        </article>

        <article className="organization-workspace__panel">
          <p className="organization-workspace__panel-kicker">Activity</p>

          <h2 className="organization-workspace__panel-title">
            Organization timeline
          </h2>

          <p className="organization-workspace__panel-copy">
            Organization lifecycle and membership activity events will be
            rendered here in reverse chronological order.
          </p>
        </article>
      </div>
    </section>
  );
}

export default OrganizationWorkspace;
