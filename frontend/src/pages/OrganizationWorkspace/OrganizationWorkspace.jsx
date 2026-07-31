import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import useAuth from "../../contexts/useAuth";
import {
  getUserAvatarUrl,
  getUserInitials,
} from "../../utils/avatar";

import {
  archiveOrganization,
  changeOrganizationMemberRole,
  createOrganizationInvitation,
  deactivateOrganizationMember,
  getOrganizationById,
  getOrganizationMembers,
  reactivateOrganizationMember,
  updateOrganization,
} from "../../utils/api";

import "./OrganizationWorkspace.css";

const EMPTY_PROFILE = {
  name: "",
  slug: "",
  description: "",
};

function normalizeSlug(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatLabel(value, fallback = "Unknown") {
  if (!value) {
    return fallback;
  }

  return value
    .toString()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function validateProfile({ name, slug, description }) {
  const errors = {};

  if (name.length < 2) {
    errors.name = "Organization name must contain at least 2 characters.";
  } else if (name.length > 120) {
    errors.name = "Organization name cannot exceed 120 characters.";
  }

  if (slug.length < 2) {
    errors.slug = "Organization slug must contain at least 2 characters.";
  } else if (slug.length > 120) {
    errors.slug = "Organization slug cannot exceed 120 characters.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = "Use lowercase letters, numbers, and single hyphens.";
  }

  if (description.length > 1000) {
    errors.description =
      "Organization description cannot exceed 1000 characters.";
  }

  return errors;
}

const MEMBER_ROLE_ORDER = {
  owner: 0,
  admin: 1,
  member: 2,
};

const MEMBER_STATUS_ORDER = {
  active: 0,
  invited: 1,
  inactive: 2,
  removed: 3,
};

function compareWorkspaceMembers(firstMember, secondMember) {
  const roleDifference =
    (MEMBER_ROLE_ORDER[firstMember.role] ?? 99) -
    (MEMBER_ROLE_ORDER[secondMember.role] ?? 99);

  if (roleDifference !== 0) {
    return roleDifference;
  }

  const statusDifference =
    (MEMBER_STATUS_ORDER[firstMember.status] ?? 99) -
    (MEMBER_STATUS_ORDER[secondMember.status] ?? 99);

  if (statusDifference !== 0) {
    return statusDifference;
  }

  return (
    new Date(firstMember.createdAt || 0) -
    new Date(secondMember.createdAt || 0)
  );
}

function OrganizationWorkspace() {
  const { organizationId } = useParams();
  const { token } = useAuth();

  const [organization, setOrganization] = useState(null);

  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const [submitError, setSubmitError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [isArchiveConfirming, setIsArchiveConfirming] =
    useState(false);

  const [isArchiving, setIsArchiving] = useState(false);

  const [archiveError, setArchiveError] = useState("");

  const [members, setMembers] = useState([]);

  const [currentMembership, setCurrentMembership] =
    useState(null);

  const [isMembersLoading, setIsMembersLoading] =
    useState(true);

  const [membersError, setMembersError] = useState("");

  const [invitationForm, setInvitationForm] =
    useState({
      email: "",
      role: "member",
    });

  const [invitationFieldErrors, setInvitationFieldErrors] =
    useState({});

  const [invitationError, setInvitationError] =
    useState("");

  const [invitationSuccess, setInvitationSuccess] =
    useState("");

  const [isInviting, setIsInviting] =
    useState(false);

  const [memberOperation, setMemberOperation] = useState({
    membershipId: "",
    action: "",
  });

  const [memberConfirmation, setMemberConfirmation] = useState({
    membershipId: "",
    action: "",
  });

  const [memberFeedback, setMemberFeedback] = useState({});

  useEffect(() => {
    let isActive = true;

    async function loadOrganization() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getOrganizationById({
          token,
          organizationId,
        });

        if (!response?.organization) {
          throw new Error(
            "The server returned an incomplete organization response.",
          );
        }

        if (!isActive) {
          return;
        }

        setOrganization(response.organization);

        setProfileForm({
          name: response.organization.name || "",
          slug: response.organization.slug || "",
          description: response.organization.description || "",
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(error?.message || "The organization could not be loaded.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    if (token && organizationId) {
      loadOrganization();
    }

    return () => {
      isActive = false;
    };
  }, [token, organizationId]);

  useEffect(() => {
    let isActive = true;

    async function loadMembers() {
      setIsMembersLoading(true);
      setMembersError("");

      try {
        const response = await getOrganizationMembers({
          token,
          organizationId,
        });

        if (!isActive) {
          return;
        }

        setMembers(
          Array.isArray(response?.members)
            ? response.members
            : [],
        );

        setCurrentMembership(
          response?.currentMembership || null,
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        setMembers([]);
        setCurrentMembership(null);

        setMembersError(
          error?.message ||
            "The organization members could not be loaded.",
        );
      } finally {
        if (isActive) {
          setIsMembersLoading(false);
        }
      }
    }

    if (token && organizationId) {
      loadMembers();
    }

    return () => {
      isActive = false;
    };
  }, [token, organizationId]);

  const role = organization?.membership?.role || "member";

  const membershipStatus = organization?.membership?.status || "active";

  const organizationStatus = organization?.status || "active";

  const isArchived = organizationStatus === "archived";

  const canEdit = ["owner", "admin"].includes(role) && !isArchived;

  const canArchive = role === "owner" && !isArchived;

  const canInvite =
    ["owner", "admin"].includes(role) && !isArchived;

  const hasPendingMemberOperation =
    Boolean(memberOperation.membershipId);

  const normalizedForm = useMemo(
    () => ({
      name: profileForm.name.trim(),
      slug: normalizeSlug(profileForm.slug),
      description: profileForm.description.trim(),
    }),
    [profileForm],
  );

  const hasProfileChanges = useMemo(() => {
    if (!organization) {
      return false;
    }

    return (
      normalizedForm.name !== (organization.name || "") ||
      normalizedForm.slug !== (organization.slug || "") ||
      normalizedForm.description !== (organization.description || "")
    );
  }, [normalizedForm, organization]);

  function resetProfileForm(nextOrganization) {
    setProfileForm({
      name: nextOrganization?.name || "",
      slug: nextOrganization?.slug || "",
      description: nextOrganization?.description || "",
    });

    setFieldErrors({});
    setSubmitError("");
  }

  function handleStartEditing() {
    resetProfileForm(organization);
    setSuccessMessage("");
    setIsEditing(true);
  }

  function handleCancelEditing() {
    resetProfileForm(organization);
    setSuccessMessage("");
    setIsEditing(false);
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;

    const nextValue = name === "slug" ? normalizeSlug(value) : value;

    setProfileForm((currentForm) => ({
      ...currentForm,
      [name]: nextValue,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setSubmitError("");
    setSuccessMessage("");
  }

  function handleProfileKeyDown(event) {
    if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
      event.preventDefault();
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    if (isSaving || !canEdit) {
      return;
    }

    const validationErrors = validateProfile(normalizedForm);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitError("");

      return;
    }

    if (!hasProfileChanges) {
      setSubmitError("Change at least one profile field before saving.");

      return;
    }

    setIsSaving(true);
    setFieldErrors({});
    setSubmitError("");
    setSuccessMessage("");

    try {
      const response = await updateOrganization({
        token,
        organizationId,
        ...normalizedForm,
      });

      if (!response?.organization) {
        throw new Error(
          "The organization was updated, but the server returned an incomplete response.",
        );
      }

      setOrganization(response.organization);
      resetProfileForm(response.organization);
      setIsEditing(false);

      setSuccessMessage("Organization profile updated successfully.");
    } catch (error) {
      setFieldErrors(error?.fields || {});

      setSubmitError(
        error?.message || "The organization profile could not be updated.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleInvitationChange(event) {
    const { name, value } = event.target;

    setInvitationForm((currentForm) => ({
      ...currentForm,
      [name]:
        name === "email"
          ? value
          : value.toLowerCase(),
    }));

    setInvitationFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));

    setInvitationError("");
    setInvitationSuccess("");
  }

  function handleInvitationKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }

  async function handleInvitationSubmit(event) {
    event.preventDefault();

    if (isInviting || !canInvite) {
      return;
    }

    const normalizedEmail =
      invitationForm.email.trim().toLowerCase();

    const normalizedRole =
      role === "admin"
        ? "member"
        : invitationForm.role;

    const validationErrors = {};

    if (!normalizedEmail) {
      validationErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail,
      )
    ) {
      validationErrors.email =
        "Enter a valid email address.";
    } else if (normalizedEmail.length > 254) {
      validationErrors.email =
        "Email address is too long.";
    }

    if (
      !["admin", "member"].includes(
        normalizedRole,
      )
    ) {
      validationErrors.role =
        "Select a valid organization role.";
    }

    if (
      role === "admin" &&
      normalizedRole !== "member"
    ) {
      validationErrors.role =
        "Admins may invite Members only.";
    }

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setInvitationFieldErrors(validationErrors);
      setInvitationError("");
      setInvitationSuccess("");

      return;
    }

    setIsInviting(true);
    setInvitationFieldErrors({});
    setInvitationError("");
    setInvitationSuccess("");

    try {
      const response =
        await createOrganizationInvitation({
          token,
          organizationId,
          email: normalizedEmail,
          role: normalizedRole,
        });

      if (!response?.invitation) {
        throw new Error(
          "The invitation was created, but the server returned an incomplete response.",
        );
      }

      setMembers((currentMembers) => {
        const nextMembers = currentMembers.filter(
          (member) =>
            member.id?.toString() !==
            response.invitation.id?.toString(),
        );

        return [
          ...nextMembers,
          response.invitation,
        ].sort(compareWorkspaceMembers);
      });

      setInvitationForm({
        email: "",
        role: "member",
      });

      setInvitationSuccess(
        response.message ||
          "Organization invitation created successfully.",
      );
    } catch (error) {
      setInvitationFieldErrors(
        error?.fields || {},
      );

      setInvitationError(
        error?.message ||
          "The organization invitation could not be created.",
      );
    } finally {
      setIsInviting(false);
    }
  }

  function replaceWorkspaceMember(nextMember) {
    const nextMemberId = nextMember?.id?.toString();

    if (!nextMemberId) {
      return;
    }

    setMembers((currentMembers) => {
      const remainingMembers = currentMembers.filter(
        (member) => member.id?.toString() !== nextMemberId,
      );

      return [...remainingMembers, nextMember].sort(
        compareWorkspaceMembers,
      );
    });

    setCurrentMembership((currentValue) =>
      currentValue?.id?.toString() === nextMemberId
        ? nextMember
        : currentValue,
    );
  }

  function clearMemberFeedback(membershipId) {
    const membershipKey = membershipId?.toString();

    if (!membershipKey) {
      return;
    }

    setMemberFeedback((currentFeedback) => {
      if (!currentFeedback[membershipKey]) {
        return currentFeedback;
      }

      const nextFeedback = {
        ...currentFeedback,
      };

      delete nextFeedback[membershipKey];

      return nextFeedback;
    });
  }

  function setMemberFeedbackMessage(
    membershipId,
    type,
    message,
  ) {
    const membershipKey = membershipId?.toString();

    if (!membershipKey) {
      return;
    }

    setMemberFeedback((currentFeedback) => ({
      ...currentFeedback,
      [membershipKey]: {
        type,
        message,
      },
    }));
  }

  function canManageLifecycleTarget(member) {
    const membershipId = member?.id?.toString();

    const currentMembershipId =
      currentMembership?.id?.toString();

    return Boolean(
      !isArchived &&
        ["owner", "admin"].includes(role) &&
        membershipId &&
        membershipId !== currentMembershipId &&
        member.role !== "owner" &&
        (role === "owner" || member.role === "member"),
    );
  }

  async function handleMemberRoleChange(member, nextRole) {
    const membershipId = member?.id?.toString();

    const currentMembershipId =
      currentMembership?.id?.toString();

    const normalizedNextRole =
      typeof nextRole === "string"
        ? nextRole.trim().toLowerCase()
        : "";

    if (
      hasPendingMemberOperation ||
      role !== "owner" ||
      isArchived ||
      !membershipId ||
      membershipId === currentMembershipId ||
      member.status !== "active" ||
      member.role === "owner" ||
      !["admin", "member"].includes(normalizedNextRole) ||
      normalizedNextRole === member.role
    ) {
      return;
    }

    setMemberOperation({
      membershipId,
      action: "role",
    });

    setMemberConfirmation({
      membershipId: "",
      action: "",
    });

    clearMemberFeedback(membershipId);

    try {
      const response = await changeOrganizationMemberRole({
        token,
        organizationId,
        membershipId,
        role: normalizedNextRole,
      });

      if (!response?.member) {
        throw new Error(
          "The member role changed, but the server returned an incomplete response.",
        );
      }

      replaceWorkspaceMember(response.member);

      setMemberFeedbackMessage(
        membershipId,
        "success",
        response.message ||
          `Organization member role changed to ${normalizedNextRole}.`,
      );
    } catch (error) {
      setMemberFeedbackMessage(
        membershipId,
        "error",
        error?.message ||
          "The organization member role could not be changed.",
      );
    } finally {
      setMemberOperation({
        membershipId: "",
        action: "",
      });
    }
  }

  function handleBeginMemberDeactivation(member) {
    const membershipId = member?.id?.toString();

    if (
      hasPendingMemberOperation ||
      !canManageLifecycleTarget(member) ||
      member.status !== "active"
    ) {
      return;
    }

    clearMemberFeedback(membershipId);

    setMemberConfirmation({
      membershipId,
      action: "deactivate",
    });
  }

  function handleCancelMemberDeactivation() {
    if (hasPendingMemberOperation) {
      return;
    }

    setMemberConfirmation({
      membershipId: "",
      action: "",
    });
  }

  async function handleMemberLifecycle(member, action) {
    const membershipId = member?.id?.toString();

    const isDeactivateAction =
      action === "deactivate";

    const isReactivateAction =
      action === "reactivate";

    const expectedStatus = isDeactivateAction
      ? "active"
      : "inactive";

    if (
      hasPendingMemberOperation ||
      !canManageLifecycleTarget(member) ||
      member.status !== expectedStatus ||
      (!isDeactivateAction && !isReactivateAction)
    ) {
      return;
    }

    setMemberOperation({
      membershipId,
      action,
    });

    clearMemberFeedback(membershipId);

    try {
      const request = isDeactivateAction
        ? deactivateOrganizationMember
        : reactivateOrganizationMember;

      const response = await request({
        token,
        organizationId,
        membershipId,
      });

      if (!response?.member) {
        throw new Error(
          `The member was ${
            isDeactivateAction
              ? "deactivated"
              : "reactivated"
          }, but the server returned an incomplete response.`,
        );
      }

      replaceWorkspaceMember(response.member);

      setMemberFeedbackMessage(
        membershipId,
        "success",
        response.message ||
          `Organization member ${
            isDeactivateAction
              ? "deactivated"
              : "reactivated"
          }.`,
      );

      setMemberConfirmation({
        membershipId: "",
        action: "",
      });
    } catch (error) {
      setMemberFeedbackMessage(
        membershipId,
        "error",
        error?.message ||
          `The organization member could not be ${
            isDeactivateAction
              ? "deactivated"
              : "reactivated"
          }.`,
      );
    } finally {
      setMemberOperation({
        membershipId: "",
        action: "",
      });
    }
  }

  function handleBeginArchive() {
    setArchiveError("");
    setSuccessMessage("");
    setIsArchiveConfirming(true);
  }

  function handleCancelArchive() {
    if (isArchiving) {
      return;
    }

    setArchiveError("");
    setIsArchiveConfirming(false);
  }

  function handleArchiveConfirmationKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }

  async function handleArchiveOrganization() {
    if (isArchiving || !canArchive) {
      return;
    }

    setIsArchiving(true);
    setArchiveError("");
    setSuccessMessage("");

    try {
      const response = await archiveOrganization({
        token,
        organizationId,
      });

      if (!response?.organization) {
        throw new Error(
          "The organization was archived, but the server returned an incomplete response.",
        );
      }

      setOrganization(response.organization);
      resetProfileForm(response.organization);

      setIsEditing(false);
      setIsArchiveConfirming(false);

      setSuccessMessage(
        response.message ||
          "Organization archived successfully.",
      );
    } catch (error) {
      setArchiveError(
        error?.message ||
          "The organization could not be archived.",
      );
    } finally {
      setIsArchiving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="organization-workspace">
        <div
          className="organization-workspace__state"
          role="status"
          aria-live="polite"
        >
          <p className="organization-workspace__eyebrow">
            Organization Workspace
          </p>

          <h1 className="organization-workspace__title">
            Loading organization
          </h1>

          <p className="organization-workspace__subtitle">
            Retrieving the organization profile and membership permissions.
          </p>
        </div>
      </section>
    );
  }

  if (loadError || !organization) {
    return (
      <section className="organization-workspace">
        <div className="organization-workspace__state">
          <p className="organization-workspace__eyebrow">
            Organization Workspace
          </p>

          <h1 className="organization-workspace__title">
            Organization unavailable
          </h1>

          <p className="organization-workspace__state-error" role="alert">
            {loadError || "The organization could not be loaded."}
          </p>

          <Link
            className="organization-workspace__directory-link"
            to="/organizations"
          >
            All organizations
          </Link>
        </div>
      </section>
    );
  }

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
            {organization.name}
          </h1>

          <p className="organization-workspace__subtitle">
            {organization.description ||
              "This organization has not added a description yet."}
          </p>
        </div>

        <Link
          className="organization-workspace__directory-link"
          to="/organizations"
        >
          All organizations
        </Link>
      </header>

      <div className="organization-workspace__summary">
        <div className="organization-workspace__identity">
          <span className="organization-workspace__identity-label">
            Organization ID
          </span>

          <code className="organization-workspace__identity-value">
            {organization.id || organization._id || organizationId}
          </code>
        </div>

        <div className="organization-workspace__badges">
          <span
            className={`organization-workspace__badge organization-workspace__badge--${role}`}
          >
            {formatLabel(role)}
          </span>

          <span
            className={`organization-workspace__badge organization-workspace__badge--${organizationStatus}`}
          >
            {formatLabel(organizationStatus)}
          </span>
        </div>
      </div>

      {successMessage && (
        <p
          className="organization-workspace__success"
          role="status"
          aria-live="polite"
        >
          {successMessage}
        </p>
      )}

      <article className="organization-workspace__profile">
        <div className="organization-workspace__profile-header">
          <div>
            <p className="organization-workspace__panel-kicker">Profile</p>

            <h2 className="organization-workspace__panel-title">
              Organization profile
            </h2>

            <p className="organization-workspace__panel-copy">
              Review the organization identity, workspace description, and your
              current access level.
            </p>
          </div>

          {canEdit && !isEditing && (
            <button
              className="organization-workspace__edit-button"
              type="button"
              onClick={handleStartEditing}
            >
              Edit profile
            </button>
          )}
        </div>

        {isArchived && (
          <div className="organization-workspace__notice">
            <strong>Archived organization</strong>

            <span>
              This organization is read-only. Profile, membership, and role
              changes are disabled.
            </span>
          </div>
        )}

        {!canEdit && !isArchived && (
          <div className="organization-workspace__notice">
            <strong>Read-only profile</strong>

            <span>
              Members can review organization details, but only Owners and
              Admins can edit them.
            </span>
          </div>
        )}

        {isEditing ? (
          <form
            className="organization-workspace__form"
            onSubmit={handleProfileSubmit}
            onKeyDown={handleProfileKeyDown}
            noValidate
          >
            {submitError && (
              <p className="organization-workspace__form-error" role="alert">
                {submitError}
              </p>
            )}

            <div className="organization-workspace__form-grid">
              <div className="organization-workspace__field">
                <label htmlFor="organization-profile-name">
                  Organization name
                </label>

                <input
                  id="organization-profile-name"
                  name="name"
                  type="text"
                  value={profileForm.name}
                  maxLength={120}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name
                      ? "organization-profile-name-error"
                      : undefined
                  }
                  onChange={handleProfileChange}
                />

                {fieldErrors.name && (
                  <span
                    id="organization-profile-name-error"
                    className="organization-workspace__field-error"
                  >
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              <div className="organization-workspace__field">
                <label htmlFor="organization-profile-slug">
                  Organization slug
                </label>

                <input
                  id="organization-profile-slug"
                  name="slug"
                  type="text"
                  value={profileForm.slug}
                  maxLength={120}
                  disabled={isSaving}
                  spellCheck="false"
                  aria-invalid={Boolean(fieldErrors.slug)}
                  aria-describedby={
                    fieldErrors.slug
                      ? "organization-profile-slug-error"
                      : "organization-profile-slug-hint"
                  }
                  onChange={handleProfileChange}
                />

                {fieldErrors.slug ? (
                  <span
                    id="organization-profile-slug-error"
                    className="organization-workspace__field-error"
                  >
                    {fieldErrors.slug}
                  </span>
                ) : (
                  <span
                    id="organization-profile-slug-hint"
                    className="organization-workspace__field-hint"
                  >
                    /{normalizedForm.slug || "organization"}
                  </span>
                )}
              </div>

              <div className="organization-workspace__field organization-workspace__field--full">
                <div className="organization-workspace__field-heading">
                  <label htmlFor="organization-profile-description">
                    Description
                  </label>

                  <span>{profileForm.description.length}/1000</span>
                </div>

                <textarea
                  id="organization-profile-description"
                  name="description"
                  value={profileForm.description}
                  maxLength={1000}
                  rows={5}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={
                    fieldErrors.description
                      ? "organization-profile-description-error"
                      : undefined
                  }
                  onChange={handleProfileChange}
                />

                {fieldErrors.description && (
                  <span
                    id="organization-profile-description-error"
                    className="organization-workspace__field-error"
                  >
                    {fieldErrors.description}
                  </span>
                )}
              </div>
            </div>

            <div className="organization-workspace__form-actions">
              <button
                className="organization-workspace__save-button"
                type="submit"
                disabled={isSaving || !hasProfileChanges}
              >
                {isSaving ? "Saving profile..." : "Save profile"}
              </button>

              <button
                className="organization-workspace__cancel-button"
                type="button"
                onClick={handleCancelEditing}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="organization-workspace__details">
            <div>
              <dt>Name</dt>
              <dd>{organization.name}</dd>
            </div>

            <div>
              <dt>Slug</dt>
              <dd>/{organization.slug}</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>{formatLabel(organizationStatus)}</dd>
            </div>

            <div>
              <dt>Your role</dt>
              <dd>{formatLabel(role)}</dd>
            </div>

            <div>
              <dt>Membership</dt>
              <dd>{formatLabel(membershipStatus)}</dd>
            </div>

            <div>
              <dt>Created</dt>
              <dd>{formatDate(organization.createdAt)}</dd>
            </div>

            <div>
              <dt>Updated</dt>
              <dd>{formatDate(organization.updatedAt)}</dd>
            </div>

            <div className="organization-workspace__details-description">
              <dt>Description</dt>
              <dd>{organization.description || "No description added."}</dd>
            </div>
          </dl>
        )}
      </article>

      {canArchive && (
        <article
          className="organization-workspace__danger-zone"
          aria-labelledby="organization-archive-title"
        >
          <div className="organization-workspace__danger-header">
            <div>
              <p className="organization-workspace__danger-kicker">
                Danger zone
              </p>

              <h2
                className="organization-workspace__panel-title"
                id="organization-archive-title"
              >
                Archive organization
              </h2>

              <p className="organization-workspace__danger-copy">
                Archiving makes this organization read-only and
                disables profile, membership, invitation, and role
                changes.
              </p>
            </div>

            {!isArchiveConfirming && (
              <button
                className="organization-workspace__archive-button"
                type="button"
                onClick={handleBeginArchive}
              >
                Archive organization
              </button>
            )}
          </div>

          {archiveError && (
            <p
              className="organization-workspace__archive-error"
              role="alert"
            >
              {archiveError}
            </p>
          )}

          {isArchiveConfirming && (
            <div className="organization-workspace__archive-confirmation">
              <strong>
                Archive {organization.name}?
              </strong>

              <p>
                This change takes effect immediately. The
                organization workspace will remain available in
                read-only mode.
              </p>

              <div className="organization-workspace__archive-actions">
                <button
                  className="organization-workspace__confirm-archive-button"
                  type="button"
                  disabled={isArchiving}
                  onClick={handleArchiveOrganization}
                  onKeyDown={handleArchiveConfirmationKeyDown}
                >
                  {isArchiving
                    ? "Archiving organization..."
                    : "Confirm archive"}
                </button>

                <button
                  className="organization-workspace__dismiss-archive-button"
                  type="button"
                  disabled={isArchiving}
                  onClick={handleCancelArchive}
                >
                  Keep organization active
                </button>
              </div>
            </div>
          )}
        </article>
      )}

      <div className="organization-workspace__grid">
        <article className="organization-workspace__panel organization-workspace__panel--members">
          <div className="organization-workspace__members-header">
            <div>
              <p className="organization-workspace__panel-kicker">
                Members
              </p>

              <h2 className="organization-workspace__panel-title">
                Membership directory
              </h2>

              <p className="organization-workspace__panel-copy">
                Review organization members, roles,
                invitation states, and membership status.
              </p>
            </div>

            {!isMembersLoading && !membersError && (
              <span className="organization-workspace__members-count">
                {members.length}{" "}
                {members.length === 1 ? "member" : "members"}
              </span>
            )}
          </div>

          {canInvite && (
            <section
              className="organization-workspace__invitation-panel"
              aria-labelledby="organization-invitation-title"
            >
              <div>
                <p className="organization-workspace__invitation-kicker">
                  Invite a member
                </p>

                <h3
                  className="organization-workspace__invitation-title"
                  id="organization-invitation-title"
                >
                  Add someone to this organization
                </h3>

                <p className="organization-workspace__invitation-copy">
                  Invite an existing SkillForge account by
                  email address.
                </p>
              </div>

              <form
                className="organization-workspace__invitation-form"
                onSubmit={handleInvitationSubmit}
                onKeyDown={handleInvitationKeyDown}
                noValidate
              >
                {invitationSuccess && (
                  <p
                    className="organization-workspace__invitation-success"
                    role="status"
                    aria-live="polite"
                  >
                    {invitationSuccess}
                  </p>
                )}

                {invitationError && (
                  <p
                    className="organization-workspace__invitation-error"
                    role="alert"
                  >
                    {invitationError}
                  </p>
                )}

                <div className="organization-workspace__invitation-fields">
                  <div className="organization-workspace__invitation-field">
                    <label htmlFor="organization-invitation-email">
                      Email address
                    </label>

                    <input
                      id="organization-invitation-email"
                      name="email"
                      type="email"
                      value={invitationForm.email}
                      maxLength={254}
                      autoComplete="email"
                      placeholder="member@example.com"
                      disabled={isInviting}
                      aria-invalid={Boolean(
                        invitationFieldErrors.email,
                      )}
                      aria-describedby={
                        invitationFieldErrors.email
                          ? "organization-invitation-email-error"
                          : undefined
                      }
                      onChange={handleInvitationChange}
                    />

                    {invitationFieldErrors.email && (
                      <span
                        id="organization-invitation-email-error"
                        className="organization-workspace__invitation-field-error"
                      >
                        {invitationFieldErrors.email}
                      </span>
                    )}
                  </div>

                  <div className="organization-workspace__invitation-field">
                    <label htmlFor="organization-invitation-role">
                      Organization role
                    </label>

                    <select
                      id="organization-invitation-role"
                      name="role"
                      value={
                        role === "admin"
                          ? "member"
                          : invitationForm.role
                      }
                      disabled={isInviting}
                      aria-invalid={Boolean(
                        invitationFieldErrors.role,
                      )}
                      aria-describedby={
                        invitationFieldErrors.role
                          ? "organization-invitation-role-error"
                          : "organization-invitation-role-hint"
                      }
                      onChange={handleInvitationChange}
                    >
                      {role === "owner" && (
                        <option value="admin">
                          Admin
                        </option>
                      )}

                      <option value="member">
                        Member
                      </option>
                    </select>

                    {invitationFieldErrors.role ? (
                      <span
                        id="organization-invitation-role-error"
                        className="organization-workspace__invitation-field-error"
                      >
                        {invitationFieldErrors.role}
                      </span>
                    ) : (
                      <span
                        id="organization-invitation-role-hint"
                        className="organization-workspace__invitation-field-hint"
                      >
                        {role === "owner"
                          ? "Owners may invite Admins or Members."
                          : "Admins may invite Members only."}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="organization-workspace__invite-button"
                  type="submit"
                  disabled={
                    isInviting ||
                    !invitationForm.email.trim()
                  }
                >
                  {isInviting
                    ? "Sending invitation..."
                    : "Send invitation"}
                </button>
              </form>
            </section>
          )}

          {isMembersLoading && (
            <div
              className="organization-workspace__members-state"
              role="status"
              aria-live="polite"
            >
              Loading organization members...
            </div>
          )}

          {!isMembersLoading && membersError && (
            <div
              className="organization-workspace__members-error"
              role="alert"
            >
              {membersError}
            </div>
          )}

          {!isMembersLoading &&
            !membersError &&
            members.length === 0 && (
              <div className="organization-workspace__members-state">
                No organization memberships were found.
              </div>
            )}

          {!isMembersLoading &&
            !membersError &&
            members.length > 0 && (
              <div className="organization-workspace__member-list">
                {members.map((member) => {
                  const membershipId =
                    member.id?.toString() || "";

                  const isCurrentMember =
                    currentMembership?.id?.toString() ===
                    membershipId;

                  const isThisMemberPending =
                    memberOperation.membershipId ===
                    membershipId;

                  const isConfirmingDeactivation =
                    memberConfirmation.membershipId ===
                      membershipId &&
                    memberConfirmation.action ===
                      "deactivate";

                  const canChangeMemberRole =
                    role === "owner" &&
                    !isArchived &&
                    !isCurrentMember &&
                    member.status === "active" &&
                    member.role !== "owner";

                  const canManageLifecycle =
                    canManageLifecycleTarget(member);

                  const canDeactivateMember =
                    canManageLifecycle &&
                    member.status === "active";

                  const canReactivateMember =
                    canManageLifecycle &&
                    member.status === "inactive";

                  const feedback =
                    memberFeedback[membershipId] || null;

                  const memberAvatarUrl = getUserAvatarUrl(member);
                  const memberInitials = getUserInitials(member);

                  const membershipDate =
                    member.status === "invited"
                      ? member.invitedAt
                      : member.status === "active"
                        ? member.joinedAt
                        : member.leftAt ||
                          member.updatedAt;

                  const membershipDateLabel =
                    member.status === "invited"
                      ? "Invited"
                      : member.status === "active"
                        ? "Joined"
                        : member.status === "inactive"
                          ? "Deactivated"
                          : member.status === "removed"
                            ? "Removed"
                            : "Updated";

                  return (
                    <article
                      className={`organization-workspace__member-card${
                        isCurrentMember
                          ? " organization-workspace__member-card--current"
                          : ""
                      }`}
                      key={member.id}
                    >
                      <div className="organization-workspace__member-heading">
                        <div className="organization-workspace__member-identity">
                          {memberAvatarUrl ? (
                            <img
                              className="organization-workspace__member-avatar"
                              src={memberAvatarUrl}
                              alt={`${member.fullName || "Organization member"} avatar`}
                              loading="lazy"
                            />
                          ) : (
                            <span
                              className="organization-workspace__member-avatar organization-workspace__member-avatar--fallback"
                              aria-hidden="true"
                            >
                              {memberInitials}
                            </span>
                          )}

                          <div className="organization-workspace__member-copy">
                            <div className="organization-workspace__member-name-row">
                              <h3 className="organization-workspace__member-name">
                                {member.fullName ||
                                  "Unnamed member"}
                              </h3>

                              {isCurrentMember && (
                                <span className="organization-workspace__current-member-badge">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="organization-workspace__member-email">
                              {member.email ||
                                "Email unavailable"}
                            </p>
                          </div>
                        </div>

                        <div className="organization-workspace__member-badges">
                          <span
                            className={`organization-workspace__member-badge organization-workspace__member-badge--${member.role}`}
                          >
                            {formatLabel(member.role)}
                          </span>

                          <span
                            className={`organization-workspace__member-badge organization-workspace__member-badge--${member.status}`}
                          >
                            {formatLabel(member.status)}
                          </span>
                        </div>
                      </div>

                      <dl className="organization-workspace__member-details">
                        <div>
                          <dt>{membershipDateLabel}</dt>
                          <dd>{formatDate(membershipDate)}</dd>
                        </div>

                        {member.invitedBy && (
                          <div>
                            <dt>Invited by</dt>
                            <dd>
                              {member.invitedBy.fullName ||
                                member.invitedBy.email ||
                                "Organization member"}
                            </dd>
                          </div>
                        )}
                      </dl>

                      {(canChangeMemberRole ||
                        canDeactivateMember ||
                        canReactivateMember) && (
                        <div className="organization-workspace__member-controls">
                          <p className="organization-workspace__member-controls-title">
                            {role === "owner"
                              ? "Owner controls"
                              : "Admin controls"}
                          </p>

                          {!isConfirmingDeactivation && (
                            <div className="organization-workspace__member-actions">
                              {canChangeMemberRole && (
                                <button
                                  className="organization-workspace__member-action-button organization-workspace__member-action-button--role"
                                  type="button"
                                  disabled={hasPendingMemberOperation}
                                  onClick={() =>
                                    handleMemberRoleChange(
                                      member,
                                      member.role === "admin"
                                        ? "member"
                                        : "admin",
                                    )
                                  }
                                >
                                  {isThisMemberPending &&
                                  memberOperation.action === "role"
                                    ? "Updating role..."
                                    : member.role === "admin"
                                      ? "Change to Member"
                                      : "Promote to Admin"}
                                </button>
                              )}

                              {canDeactivateMember && (
                                <button
                                  className="organization-workspace__member-action-button organization-workspace__member-action-button--deactivate"
                                  type="button"
                                  disabled={hasPendingMemberOperation}
                                  onClick={() =>
                                    handleBeginMemberDeactivation(member)
                                  }
                                >
                                  Deactivate
                                </button>
                              )}

                              {canReactivateMember && (
                                <button
                                  className="organization-workspace__member-action-button organization-workspace__member-action-button--reactivate"
                                  type="button"
                                  disabled={hasPendingMemberOperation}
                                  onClick={() =>
                                    handleMemberLifecycle(
                                      member,
                                      "reactivate",
                                    )
                                  }
                                >
                                  {isThisMemberPending &&
                                  memberOperation.action === "reactivate"
                                    ? "Reactivating..."
                                    : "Reactivate"}
                                </button>
                              )}
                            </div>
                          )}

                          {isConfirmingDeactivation && (
                            <div
                              className="organization-workspace__member-confirmation"
                              role="group"
                              aria-label={`Confirm deactivation for ${
                                member.fullName ||
                                member.email ||
                                "organization member"
                              }`}
                            >
                              <p className="organization-workspace__member-confirmation-copy">
                                Deactivate this member? They will lose
                                access until reactivated.
                              </p>

                              <div className="organization-workspace__member-confirmation-actions">
                                <button
                                  className="organization-workspace__member-action-button organization-workspace__member-action-button--deactivate"
                                  type="button"
                                  disabled={hasPendingMemberOperation}
                                  onClick={() =>
                                    handleMemberLifecycle(
                                      member,
                                      "deactivate",
                                    )
                                  }
                                >
                                  {isThisMemberPending &&
                                  memberOperation.action === "deactivate"
                                    ? "Deactivating..."
                                    : "Confirm deactivation"}
                                </button>

                                <button
                                  className="organization-workspace__member-action-button organization-workspace__member-action-button--cancel"
                                  type="button"
                                  disabled={hasPendingMemberOperation}
                                  onClick={handleCancelMemberDeactivation}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {feedback && (
                        <div
                          className={`organization-workspace__member-feedback organization-workspace__member-feedback--${feedback.type}`}
                          role={
                            feedback.type === "error"
                              ? "alert"
                              : "status"
                          }
                          aria-live="polite"
                        >
                          {feedback.message}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
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
