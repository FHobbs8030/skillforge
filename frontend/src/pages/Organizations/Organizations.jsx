import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useAuth from "../../contexts/useAuth";
import {
  getOrganizations,
  getPendingOrganizationInvitations,
} from "../../utils/api";

import "./Organizations.css";

function normalizeOrganizations(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.organizations)) {
    return response.organizations;
  }

  if (Array.isArray(response?.data?.organizations)) {
    return response.data.organizations;
  }

  return [];
}

function normalizeInvitations(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.invitations)) {
    return response.invitations;
  }

  if (Array.isArray(response?.data?.invitations)) {
    return response.data.invitations;
  }

  return [];
}

function getOrganizationId(organization) {
  return (
    organization?.id ||
    organization?._id ||
    organization?.organizationId ||
    ""
  );
}

function getOrganizationRole(organization) {
  return (
    organization?.membership?.role ||
    organization?.role ||
    organization?.membershipRole ||
    "member"
  );
}

function getOrganizationStatus(organization) {
  return organization?.status || "active";
}

function formatLabel(value, fallback = "Not available") {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  return value
    .trim()
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "Date not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function Organizations() {
  const { token } = useAuth();

  const [organizations, setOrganizations] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);

  const [organizationsError, setOrganizationsError] = useState("");
  const [invitationsError, setInvitationsError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadOrganizationWorkspace() {
      setIsLoadingOrganizations(true);
      setIsLoadingInvitations(true);
      setOrganizationsError("");
      setInvitationsError("");

      const [organizationResult, invitationResult] =
        await Promise.allSettled([
          getOrganizations(token),
          getPendingOrganizationInvitations(token),
        ]);

      if (!isActive) {
        return;
      }

      if (organizationResult.status === "fulfilled") {
        setOrganizations(
          normalizeOrganizations(organizationResult.value),
        );
      } else {
        setOrganizations([]);
        setOrganizationsError(
          organizationResult.reason?.message ||
            "Organizations could not be loaded. Please try again.",
        );
      }

      if (invitationResult.status === "fulfilled") {
        setInvitations(
          normalizeInvitations(invitationResult.value),
        );
      } else {
        setInvitations([]);
        setInvitationsError(
          invitationResult.reason?.message ||
            "Organization invitations could not be loaded. Please try again.",
        );
      }

      setIsLoadingOrganizations(false);
      setIsLoadingInvitations(false);
    }

    loadOrganizationWorkspace();

    return () => {
      isActive = false;
    };
  }, [token]);

  const organizationStats = useMemo(() => {
    const ownedOrganizations = organizations.filter(
      (organization) =>
        getOrganizationRole(organization).toLowerCase() === "owner",
    ).length;

    const administeredOrganizations = organizations.filter(
      (organization) =>
        getOrganizationRole(organization).toLowerCase() === "admin",
    ).length;

    return {
      total: organizations.length,
      owned: ownedOrganizations,
      administered: administeredOrganizations,
      pendingInvitations: invitations.length,
    };
  }, [invitations, organizations]);

  return (
    <section
      className="organizations"
      aria-labelledby="organizations-title"
    >
      <header className="organizations__header">
        <div>
          <p className="organizations__eyebrow">
            Organization Workspace
          </p>

          <h1
            className="organizations__title"
            id="organizations-title"
          >
            Your SkillForge organizations
          </h1>

          <p className="organizations__subtitle">
            Review the organizations connected to your authenticated
            SkillForge account, including your current role and any
            pending invitations.
          </p>
        </div>

        <Link
          className="organizations__dashboard-link"
          to="/app"
        >
          Back to dashboard
        </Link>
      </header>

      <div
        className="organizations__metrics"
        aria-label="Organization overview"
      >
        <article className="organizations__metric">
          <span className="organizations__metric-label">
            Organizations
          </span>

          <strong className="organizations__metric-value">
            {organizationStats.total}
          </strong>

          <span className="organizations__metric-detail">
            Active memberships
          </span>
        </article>

        <article className="organizations__metric">
          <span className="organizations__metric-label">
            Owner
          </span>

          <strong className="organizations__metric-value">
            {organizationStats.owned}
          </strong>

          <span className="organizations__metric-detail">
            Organizations you own
          </span>
        </article>

        <article className="organizations__metric">
          <span className="organizations__metric-label">
            Admin
          </span>

          <strong className="organizations__metric-value">
            {organizationStats.administered}
          </strong>

          <span className="organizations__metric-detail">
            Admin memberships
          </span>
        </article>

        <article className="organizations__metric">
          <span className="organizations__metric-label">
            Invitations
          </span>

          <strong className="organizations__metric-value">
            {organizationStats.pendingInvitations}
          </strong>

          <span className="organizations__metric-detail">
            Awaiting your response
          </span>
        </article>
      </div>

      <div className="organizations__workspace-grid">
        <article className="organizations__panel">
          <div className="organizations__panel-heading">
            <div>
              <p className="organizations__panel-kicker">
                Directory
              </p>

              <h2 className="organizations__panel-title">
                Organization memberships
              </h2>
            </div>

            {!isLoadingOrganizations && !organizationsError && (
              <span className="organizations__status">
                {organizations.length} available
              </span>
            )}
          </div>

          {isLoadingOrganizations && (
            <p
              className="organizations__state"
              role="status"
              aria-live="polite"
            >
              Loading your organizations...
            </p>
          )}

          {!isLoadingOrganizations && organizationsError && (
            <p
              className="organizations__state organizations__state--error"
              role="alert"
            >
              {organizationsError}
            </p>
          )}

          {!isLoadingOrganizations &&
            !organizationsError &&
            organizations.length === 0 && (
              <div className="organizations__empty-state">
                <h3>No active organizations yet</h3>

                <p>
                  Organizations you create or join will appear here.
                </p>
              </div>
            )}

          {!isLoadingOrganizations &&
            !organizationsError &&
            organizations.length > 0 && (
              <div className="organizations__card-list">
                {organizations.map((organization) => {
                  const organizationId =
                    getOrganizationId(organization);

                  const role = getOrganizationRole(organization);
                  const status =
                    getOrganizationStatus(organization);

                  return (
                    <Link
                      key={organizationId}
                      className="organizations__card"
                      to={`/organizations/${organizationId}`}
                    >
                      <div className="organizations__card-heading">
                        <div>
                          <h3 className="organizations__card-title">
                            {organization.name ||
                              "Untitled organization"}
                          </h3>

                          <p className="organizations__card-slug">
                            {organization.slug
                              ? `/${organization.slug}`
                              : "Slug not available"}
                          </p>
                        </div>

                        <div className="organizations__card-badges">
                          <span className="organizations__badge organizations__badge--role">
                            {formatLabel(role)}
                          </span>

                          <span className="organizations__badge">
                            {formatLabel(status)}
                          </span>
                        </div>
                      </div>

                      <p className="organizations__card-description">
                        {organization.description ||
                          "No organization description has been added."}
                      </p>

                      <span className="organizations__card-meta">
                        Updated {formatDate(organization.updatedAt)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
        </article>

        <article className="organizations__panel">
          <div className="organizations__panel-heading">
            <div>
              <p className="organizations__panel-kicker">
                Invitations
              </p>

              <h2 className="organizations__panel-title">
                Pending invitations
              </h2>
            </div>

            {!isLoadingInvitations && !invitationsError && (
              <span className="organizations__status">
                {invitations.length} pending
              </span>
            )}
          </div>

          {isLoadingInvitations && (
            <p
              className="organizations__state"
              role="status"
              aria-live="polite"
            >
              Loading organization invitations...
            </p>
          )}

          {!isLoadingInvitations && invitationsError && (
            <p
              className="organizations__state organizations__state--error"
              role="alert"
            >
              {invitationsError}
            </p>
          )}

          {!isLoadingInvitations &&
            !invitationsError &&
            invitations.length === 0 && (
              <div className="organizations__empty-state">
                <h3>No pending invitations</h3>

                <p>
                  New organization invitations will appear here.
                </p>
              </div>
            )}

          {!isLoadingInvitations &&
            !invitationsError &&
            invitations.length > 0 && (
              <div className="organizations__invitation-list">
                {invitations.map((invitation) => (
                  <article
                    key={
                      invitation.id ||
                      invitation._id ||
                      invitation.organizationId
                    }
                    className="organizations__invitation"
                  >
                    <div className="organizations__invitation-heading">
                      <div>
                        <h3 className="organizations__card-title">
                          {invitation.organizationName ||
                            "Untitled organization"}
                        </h3>

                        <p className="organizations__card-slug">
                          {invitation.organizationSlug
                            ? `/${invitation.organizationSlug}`
                            : "Slug not available"}
                        </p>
                      </div>

                      <span className="organizations__badge organizations__badge--role">
                        {formatLabel(invitation.role)}
                      </span>
                    </div>

                    <p className="organizations__card-description">
                      {invitation.organizationDescription ||
                        "No organization description has been added."}
                    </p>

                    <div className="organizations__invitation-meta">
                      <span>
                        Invited by{" "}
                        {invitation.invitedBy?.fullName ||
                          invitation.invitedBy?.email ||
                          "a SkillForge member"}
                      </span>

                      <span>
                        {formatDate(invitation.invitedAt)}
                      </span>
                    </div>

                    <p className="organizations__response-note">
                      Invitation response controls will be connected in
                      the next checkpoint.
                    </p>
                  </article>
                ))}
              </div>
            )}
        </article>
      </div>
    </section>
  );
}

export default Organizations;
