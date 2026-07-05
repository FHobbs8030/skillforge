import { useEffect, useState } from "react";

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

function validateProfileForm({ fullName, email }) {
  const errors = {};

  const normalizedFullName = fullName.trim();
  const normalizedEmail = email.trim();

  if (!normalizedFullName) {
    errors.fullName = "Enter your full name.";
  } else if (normalizedFullName.length < 2) {
    errors.fullName = "Full name must contain at least 2 characters.";
  } else if (normalizedFullName.length > 120) {
    errors.fullName = "Full name cannot exceed 120 characters.";
  }

  if (!normalizedEmail) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  } else if (normalizedEmail.length > 254) {
    errors.email = "Email address cannot exceed 254 characters.";
  }

  return errors;
}

function getProfileUpdateError(error) {
  const payload = error?.response?.data || error?.data || error;

  const message =
    payload?.message ||
    payload?.error ||
    error?.message ||
    "SkillForge could not update your profile. Please try again.";

  const backendErrors = payload?.fieldErrors || payload?.errors;

  const fieldErrors = {};

  if (Array.isArray(backendErrors)) {
    backendErrors.forEach((item) => {
      const field = item?.field || item?.path || item?.param;
      const fieldMessage = item?.message || item?.msg;

      if (
        (field === "fullName" || field === "email") &&
        typeof fieldMessage === "string"
      ) {
        fieldErrors[field] = fieldMessage;
      }
    });
  } else if (backendErrors && typeof backendErrors === "object") {
    ["fullName", "email"].forEach((field) => {
      const fieldError = backendErrors[field];

      if (typeof fieldError === "string") {
        fieldErrors[field] = fieldError;
      } else if (typeof fieldError?.message === "string") {
        fieldErrors[field] = fieldError.message;
      }
    });
  }

  if (
    !fieldErrors.email &&
    /email|already exists|already in use/i.test(message)
  ) {
    fieldErrors.email = message;
  }

  if (
    !fieldErrors.fullName &&
    /full[\s-]?name|name must|name is required/i.test(message)
  ) {
    fieldErrors.fullName = message;
  }

  return {
    fieldErrors,
    formError: Object.keys(fieldErrors).length === 0 ? message : "",
  };
}

function ProfilePage() {
  const { currentUser, updateCurrentUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formValues, setFormValues] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setFormValues({
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
    });
  }, [currentUser, isEditing]);

  const displayName = getDisplayName(currentUser);
  const initials = getInitials(displayName);

  const membershipKey = currentUser?.membership?.toLowerCase() || "free";

  const membership = membershipDetails[membershipKey] || membershipDetails.free;

  const handleEditProfile = () => {
    setFormValues({
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
    });

    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormValues({
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
    });

    setFieldErrors({});
    setFormError("");
    setIsEditing(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setFieldErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };

      delete nextErrors[name];

      return nextErrors;
    });

    if (formError) {
      setFormError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateProfileForm(formValues);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError("");
      setSuccessMessage("");
      return;
    }

    setIsSaving(true);
    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");

    try {
      await updateCurrentUser({
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
      });

      setSuccessMessage("Your SkillForge profile was updated successfully.");
      setIsEditing(false);
    } catch (error) {
      const profileError = getProfileUpdateError(error);

      setFieldErrors(profileError.fieldErrors);
      setFormError(profileError.formError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="profile-page" aria-labelledby="profile-page-title">
      <header className="profile-page__header">
        <div>
          <p className="profile-page__eyebrow">Authenticated Member Profile</p>

          <h1 className="profile-page__title" id="profile-page-title">
            Account Profile
          </h1>

          <p className="profile-page__subtitle">
            Review and manage the identity, membership, and security information
            connected to your SkillForge account.
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
        className={`profile-page__panel profile-page__actions${
          isEditing ? " profile-page__actions--editing" : ""
        }`}
        aria-labelledby="profile-actions-title"
      >
        <div className="profile-page__actions-header">
          <div className="profile-page__actions-copy">
            <p className="profile-page__panel-eyebrow">Profile Management</p>

            <h2 id="profile-actions-title">Account controls</h2>

            <p>
              Update the full name and email address associated with your
              authenticated SkillForge account.
            </p>
          </div>

          <div className="profile-page__planned-actions">
            {!isEditing && (
              <button
                className="profile-page__edit-button"
                type="button"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
            )}

            <span>Change Password</span>
            <span>Account Preferences</span>
          </div>
        </div>

        {successMessage && (
          <div
            className="profile-page__message profile-page__message--success"
            role="status"
            aria-live="polite"
          >
            {successMessage}
          </div>
        )}

        {isEditing && (
          <form
            className="profile-page__edit-form"
            onSubmit={handleProfileSubmit}
            noValidate
          >
            <div className="profile-page__form-grid">
              <div className="profile-page__field">
                <label htmlFor="profile-full-name">Full Name</label>

                <input
                  id="profile-full-name"
                  name="fullName"
                  type="text"
                  value={formValues.fullName}
                  onChange={handleInputChange}
                  autoComplete="name"
                  maxLength={120}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={
                    fieldErrors.fullName ? "profile-full-name-error" : undefined
                  }
                  autoFocus
                />

                {fieldErrors.fullName && (
                  <p
                    className="profile-page__field-error"
                    id="profile-full-name-error"
                    role="alert"
                  >
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div className="profile-page__field">
                <label htmlFor="profile-email">Email Address</label>

                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  maxLength={254}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "profile-email-error" : undefined
                  }
                />

                {fieldErrors.email && (
                  <p
                    className="profile-page__field-error"
                    id="profile-email-error"
                    role="alert"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            {formError && (
              <div
                className="profile-page__message profile-page__message--error"
                role="alert"
              >
                {formError}
              </div>
            )}

            <div className="profile-page__form-actions">
              <button
                className="profile-page__save-button"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </button>

              <button
                className="profile-page__cancel-button"
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </section>
  );
}

export default ProfilePage;
