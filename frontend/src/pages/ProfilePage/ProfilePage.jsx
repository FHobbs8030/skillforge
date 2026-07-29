import { useEffect, useState } from "react";

import useAuth from "../../contexts/useAuth";
import { startGitHubConnection } from "../../utils/api";
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitials,
} from "../../utils/avatar";

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

function getGitHubConnectionError(reason) {
  const messages = {
    cancelled: "GitHub authorization was cancelled.",
    github_error: "GitHub could not complete the authorization request.",
    missing_response: "GitHub returned an incomplete authorization response.",
    invalid_state:
      "The GitHub authorization request expired or was already used. Try connecting again.",
    configuration:
      "The GitHub connection is not configured correctly on the server.",
    account_in_use:
      "That GitHub account is already connected to another SkillForge account.",
    skillforge_account_missing:
      "The associated SkillForge account could not be found.",
    connection_failed:
      "SkillForge could not complete the GitHub connection. Try again.",
  };

  return (
    messages[reason] ||
    "SkillForge could not complete the GitHub connection. Try again."
  );
}

function ProfilePage() {
  const {
    token,
    currentUser,
    updateCurrentUser,
    refreshCurrentUser,
    disconnectGitHubAccount,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formValues, setFormValues] = useState({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isGitHubBusy, setIsGitHubBusy] = useState(false);
  const [githubMessage, setGitHubMessage] = useState("");
  const [githubError, setGitHubError] = useState("");

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setFormValues({
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
    });
  }, [currentUser, isEditing]);

  useEffect(() => {
    const searchParameters = new URLSearchParams(window.location.search);
    const githubStatus = searchParameters.get("github");

    if (!githubStatus) {
      return undefined;
    }

    const reason = searchParameters.get("reason") || "";

    searchParameters.delete("github");
    searchParameters.delete("reason");

    const remainingSearch = searchParameters.toString();

    const cleanUrl = `${window.location.pathname}${
      remainingSearch ? `?${remainingSearch}` : ""
    }${window.location.hash}`;

    window.history.replaceState({}, "", cleanUrl);

    let isActive = true;

    if (githubStatus === "connected") {
      setIsGitHubBusy(true);
      setGitHubError("");

      refreshCurrentUser()
        .then(() => {
          if (isActive) {
            setGitHubMessage(
              "GitHub was connected and your verified avatar was synchronized.",
            );
          }
        })
        .catch((error) => {
          if (isActive) {
            setGitHubError(
              error?.message ||
                "GitHub connected, but SkillForge could not refresh your profile.",
            );
          }
        })
        .finally(() => {
          if (isActive) {
            setIsGitHubBusy(false);
          }
        });
    } else if (githubStatus === "error") {
      setGitHubMessage("");
      setGitHubError(getGitHubConnectionError(reason));
    }

    return () => {
      isActive = false;
    };
  }, [refreshCurrentUser]);

  const displayName = getUserDisplayName(currentUser);
  const initials = getUserInitials(currentUser);
  const avatarUrl = getUserAvatarUrl(currentUser);
  const githubUsername = currentUser?.github?.username || "";
  const isGitHubConnected = Boolean(githubUsername);

  const membershipKey = currentUser?.membership?.toLowerCase() || "free";

  const membership = membershipDetails[membershipKey] || membershipDetails.free;

  const handleGitHubConnect = async () => {
    setIsGitHubBusy(true);
    setGitHubMessage("");
    setGitHubError("");

    try {
      const response = await startGitHubConnection(token);

      if (
        !response?.authorizationUrl ||
        !response.authorizationUrl.startsWith(
          "https://github.com/login/oauth/authorize",
        )
      ) {
        throw new Error(
          "The server returned an invalid GitHub authorization URL.",
        );
      }

      window.location.assign(response.authorizationUrl);
    } catch (error) {
      setGitHubError(
        error?.message ||
          "SkillForge could not start the GitHub connection.",
      );

      setIsGitHubBusy(false);
    }
  };

  const handleGitHubDisconnect = async () => {
    const confirmed = window.confirm(
      "Disconnect your verified GitHub account from SkillForge?",
    );

    if (!confirmed) {
      return;
    }

    setIsGitHubBusy(true);
    setGitHubMessage("");
    setGitHubError("");

    try {
      await disconnectGitHubAccount();

      setGitHubMessage(
        "GitHub was disconnected. SkillForge is now using your initials avatar.",
      );
    } catch (error) {
      setGitHubError(
        error?.message ||
          "SkillForge could not disconnect GitHub. Try again.",
      );
    } finally {
      setIsGitHubBusy(false);
    }
  };

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
            {avatarUrl ? (
              <img
                className="profile-page__avatar"
                src={avatarUrl}
                alt={`${displayName} avatar`}
              />
            ) : (
              <div className="profile-page__avatar" aria-hidden="true">
                {initials}
              </div>
            )}

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
              <dt>Avatar Source</dt>
              <dd>
                {avatarUrl
                  ? currentUser?.avatar?.source === "github"
                    ? "Verified GitHub account"
                    : "Profile image"
                  : "SkillForge initials"}
              </dd>
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
              Connect verified development identities to your SkillForge
              account and control which identity supplies your profile avatar.
            </p>
          </div>

          <ul className="profile-page__connection-list">
            <li>
              <div>
                <strong>GitHub</strong>
                <p>
                  {isGitHubConnected
                    ? `Verified as @${githubUsername}`
                    : "Connect a verified GitHub account to use its avatar."}
                </p>
              </div>

              <div className="profile-page__connection-actions">
                <span
                  className={`profile-page__connection-status${
                    isGitHubConnected
                      ? " profile-page__connection-status--connected"
                      : ""
                  }`}
                >
                  {isGitHubConnected ? "Connected" : "Not Connected"}
                </span>

                <button
                  className={`profile-page__connection-button${
                    isGitHubConnected
                      ? " profile-page__connection-button--disconnect"
                      : ""
                  }`}
                  type="button"
                  onClick={
                    isGitHubConnected
                      ? handleGitHubDisconnect
                      : handleGitHubConnect
                  }
                  disabled={isGitHubBusy}
                >
                  {isGitHubBusy
                    ? "Working..."
                    : isGitHubConnected
                      ? "Disconnect"
                      : "Connect GitHub"}
                </button>
              </div>
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

          {githubMessage && (
            <div
              className="profile-page__connection-message"
              role="status"
              aria-live="polite"
            >
              {githubMessage}
            </div>
          )}

          {githubError && (
            <div
              className="profile-page__connection-message profile-page__connection-message--error"
              role="alert"
            >
              {githubError}
            </div>
          )}
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
