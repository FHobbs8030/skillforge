import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useAuth from "../../contexts/useAuth";
import {
  acceptOrganizationInvitation,
  declineOrganizationInvitation,
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

function getInvitationId(invitation) {
  return (
    invitation?.id ||
    invitation?._id ||
    invitation?.organizationId ||
    ""
  );
}

function getInvitationOrganizationId(invitation) {
  return (
    invitation?.organizationId ||
    invitation?.organization?.id ||
    invitation?.organization?._id ||
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

  const [invitationActionById, setInvitationActionById] = useState({});
  const [invitationErrorById, setInvitationErrorById] = useState({});
  const [invitationSuccessMessage, setInvitationSuccessMessage] =
    useState("");

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

  async function handleInvitationResponse({
    invitation,
    action,
  }) {
    const invitationId = getInvitationId(invitation);
    const organizationId =
      getInvitationOrganizationId(invitation);

    if (!invitationId || !organizationId) {
      setInvitationErrorById((currentErrors) => ({
        ...currentErrors,
        [invitationId || organizationId || "unknown"]:
          "This invitation is missing its organization identity.",
      }));

      return;
    }

    if (invitationActionById[invitationId]) {
      return;
    }

    setInvitationActionById((currentActions) => ({
      ...currentActions,
      [invitationId]: action,
    }));

    setInvitationErrorById((currentErrors) => {
      const nextErrors = {
        ...currentErrors,
      };

      delete nextErrors[invitationId];

      return nextErrors;
    });

    setInvitationSuccessMessage("");

    try {
      if (action === "accept") {
        await acceptOrganizationInvitation({
          token,
          organizationId,
        });
      } else {
        await declineOrganizationInvitation({
          token,
          organizationId,
        });
      }

      setInvitations((currentInvitations) =>
        currentInvitations.filter(
          (currentInvitation) =>
            getInvitationId(currentInvitation) !== invitationId,
        ),
      );

      const [organizationResult, invitationResult] =
        await Promise.allSettled([
          getOrganizations(token),
          getPendingOrganizationInvitations(token),
        ]);

      if (organizationResult.status === "fulfilled") {
        setOrganizations(
          normalizeOrganizations(organizationResult.value),
        );

        setOrganizationsError("");
      } else {
        setOrganizationsError(
          action === "accept"
            ? "The invitation was accepted, but the organization directory could not be refreshed. Reload the page to try again."
            : organizationResult.reason?.message ||
                "Organizations could not be refreshed.",
        );
      }

      if (invitationResult.status === "fulfilled") {
        setInvitations(
          normalizeInvitations(invitationResult.value),
        );

        setInvitationsError("");
      } else {
        setInvitationsError(
          "The invitation response succeeded, but pending invitations could not be refreshed. Reload the page to try again.",
        );
      }

      setInvitationSuccessMessage(
        action === "accept"
          ? `You joined ${
              invitation.organizationName ||
              "the organization"
            }.`
          : `Invitation to ${
              invitation.organizationName ||
              "the organization"
            } declined.`,
      );
    } catch (error) {
      setInvitationErrorById((currentErrors) => ({
        ...currentErrors,
        [invitationId]:
          error?.message ||
          `The organization invitation could not be ${
            action === "accept" ? "accepted" : "declined"
          }. Please try again.`,
      }));
    } finally {
      setInvitationActionById((currentActions) => {
        const nextActions = {
          ...currentActions,
        };

        delete nextActions[invitationId];

        return nextActions;
      });
    }
  }

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

      {invitationSuccessMessage && (
        <p
          className="organizations__feedback"
          role="status"
          aria-live="polite"
        >
          {invitationSuccessMessage}
        </p>
      )}

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
                {invitations.map((invitation) => {
                  const invitationId =
                    getInvitationId(invitation);

                  const activeAction =
                    invitationActionById[invitationId];

                  const invitationError =
                    invitationErrorById[invitationId];

                  return (
                    <article
                      key={invitationId}
                      className="organizations__invitation"
                      aria-busy={Boolean(activeAction)}
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

                      {invitationError && (
                        <p
                          className="organizations__invitation-error"
                          role="alert"
                        >
                          {invitationError}
                        </p>
                      )}

                      <div className="organizations__invitation-actions">
                        <button
                          className="organizations__invitation-button organizations__invitation-button--accept"
                          type="button"
                          disabled={Boolean(activeAction)}
                          onClick={() =>
                            handleInvitationResponse({
                              invitation,
                              action: "accept",
                            })
                          }
                        >
                          {activeAction === "accept"
                            ? "Accepting..."
                            : "Accept invitation"}
                        </button>

                        <button
                          className="organizations__invitation-button organizations__invitation-button--decline"
                          type="button"
                          disabled={Boolean(activeAction)}
                          onClick={() =>
                            handleInvitationResponse({
                              invitation,
                              action: "decline",
                            })
                          }
                        >
                          {activeAction === "decline"
                            ? "Declining..."
                            : "Decline"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </article>
      </div>
    </section>
  );
}

export default Organizations;
