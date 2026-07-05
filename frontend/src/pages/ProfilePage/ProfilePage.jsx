import useAuth from "../../contexts/useAuth";

import "./ProfilePage.css";

const membershipDetails = {
  free: {
    label: "Free",
    description:
      "Core SkillForge account access with project workspace features added as they become available.",
  },
  pro: {
    label: "Pro",
    description:
      "Expanded SkillForge access for individual developers managing multiple projects.",
  },
  team: {
    label: "Team",
    description:
      "Collaborative SkillForge access designed for distributed project teams.",
  },
};

function getDisplayName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    "SkillForge Member"
  );
}

function getInitials(displayName) {
  if (!displayName || displayName.includes("@")) {
    return displayName?.charAt(0).toUpperCase() || "SF";
  }

  const nameParts = displayName.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0]}${
    nameParts[nameParts.length - 1][0]
  }`.toUpperCase();
}

function formatAccountDate(dateValue) {
  if (!dateValue) {
    return "Recently joined";
  }

  const accountDate = new Date(dateValue);

  if (Number.isNaN(accountDate.getTime())) {
    return "Recently joined";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(accountDate);
}

function ProfilePage() {
  const { currentUser } = useAuth();

  const displayName = getDisplayName(currentUser);
  const initials = getInitials(displayName);

  const membershipKey = currentUser?.membership?.toLowerCase() || "free";

  const membership = membershipDetails[membershipKey] || membershipDetails.free;

  return (
    <section className="profile-page" aria-labelledby="profile-page-title">
      <header className="profile-page__header">
        <div>
          <p className="profile-page__eyebrow">Authenticated Member Profile</p>

          <h1 className="profile-page__title" id="profile-page-title">
            Account Profile
          </h1>

          <p className="profile-page__subtitle">
            Review the identity, membership, and security information connected
            to your SkillForge account.
          </p>
        </div>

        <span className="profile-page__status">Account Active</span>
      </header>

      <div className="profile-page__grid">
        <article className="profile-page__panel profile-page__identity-panel">
          <div className="profile-page__identity-heading">
            <div className="profile-page__avatar" aria-hidden="true">
              {initials}
            </div>

            <div>
              <p className="profile-page__panel-eyebrow">Member Identity</p>

              <h2>{displayName}</h2>

              <p>{currentUser?.email || "Email address unavailable"}</p>
            </div>
          </div>

          <dl className="profile-page__detail-list">
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
              <dd>Not assigned</dd>
            </div>
          </dl>
        </article>

        <article className="profile-page__panel profile-page__membership-panel">
          <div>
            <p className="profile-page__panel-eyebrow">Current Membership</p>

            <div className="profile-page__membership-heading">
              <h2>{membership.label}</h2>

              <span>Active</span>
            </div>

            <p className="profile-page__membership-description">
              {membership.description}
            </p>
          </div>

          <dl className="profile-page__detail-list">
            <div>
              <dt>Member Since</dt>
              <dd>{formatAccountDate(currentUser?.createdAt)}</dd>
            </div>

            <div>
              <dt>Account Status</dt>
              <dd>Authenticated</dd>
            </div>

            <div>
              <dt>Billing Status</dt>
              <dd>
                {membershipKey === "free"
                  ? "No billing required"
                  : "Membership active"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="profile-page__panel profile-page__security-panel">
          <div>
            <p className="profile-page__panel-eyebrow">Account Security</p>

            <h2>Protected access is active</h2>

            <p className="profile-page__security-description">
              SkillForge verifies your stored session with the API before
              providing access to authenticated pages.
            </p>
          </div>

          <div className="profile-page__security-list">
            <div className="profile-page__security-item">
              <span aria-hidden="true">✓</span>

              <div>
                <strong>Authenticated session</strong>
                <p>Your current browser session is valid.</p>
              </div>
            </div>

            <div className="profile-page__security-item">
              <span aria-hidden="true">✓</span>

              <div>
                <strong>Protected account data</strong>
                <p>Your password hash is never returned to the frontend.</p>
              </div>
            </div>

            <div className="profile-page__security-item">
              <span aria-hidden="true">✓</span>

              <div>
                <strong>Verified member identity</strong>
                <p>Your account was confirmed through the SkillForge API.</p>
              </div>
            </div>
          </div>
        </article>

        <article className="profile-page__panel profile-page__connections-panel">
          <div>
            <p className="profile-page__panel-eyebrow">Profile Connections</p>

            <h2>Development accounts</h2>

            <p className="profile-page__connections-description">
              External development services will be connected to your SkillForge
              profile during future integration phases.
            </p>
          </div>

          <ul className="profile-page__connection-list">
            <li>
              <div>
                <strong>GitHub</strong>
                <p>Repository and contribution activity</p>
              </div>

              <span>Not Connected</span>
            </li>

            <li>
              <div>
                <strong>Project Workspace</strong>
                <p>Host and Collaborator project membership</p>
              </div>

              <span>Not Assigned</span>
            </li>

            <li>
              <div>
                <strong>Public Developer Profile</strong>
                <p>Shareable SkillForge development identity</p>
              </div>

              <span>Planned</span>
            </li>
          </ul>
        </article>
      </div>

      <section
        className="profile-page__panel profile-page__actions"
        aria-labelledby="profile-actions-title"
      >
        <div>
          <p className="profile-page__panel-eyebrow">Profile Management</p>

          <h2 id="profile-actions-title">Account controls</h2>

          <p>
            Profile editing, password changes, and account preferences will be
            connected after the profile API is introduced.
          </p>
        </div>

        <div className="profile-page__planned-actions">
          <span>Edit Profile</span>
          <span>Change Password</span>
          <span>Account Preferences</span>
        </div>
      </section>
    </section>
  );
}

export default ProfilePage;
