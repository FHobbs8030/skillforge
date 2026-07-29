import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import useAuth from "../../contexts/useAuth";

import { getOrganizationById, updateOrganization } from "../../utils/api";

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

  const role = organization?.membership?.role || "member";

  const membershipStatus = organization?.membership?.status || "active";

  const organizationStatus = organization?.status || "active";

  const isArchived = organizationStatus === "archived";

  const canEdit = ["owner", "admin"].includes(role) && !isArchived;

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
