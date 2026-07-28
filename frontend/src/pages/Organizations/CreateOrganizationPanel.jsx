import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../contexts/useAuth";
import { createOrganization } from "../../utils/api";

const INITIAL_FORM = {
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

function validateOrganization({ name, slug, description }) {
  const errors = {};

  if (name.length < 2) {
    errors.name =
      "Organization name must contain at least 2 characters.";
  } else if (name.length > 120) {
    errors.name =
      "Organization name cannot exceed 120 characters.";
  }

  if (slug.length < 2) {
    errors.slug =
      "Organization slug must contain at least 2 characters.";
  } else if (slug.length > 120) {
    errors.slug =
      "Organization slug cannot exceed 120 characters.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug =
      "Use lowercase letters, numbers, and single hyphens.";
  }

  if (description.length > 1000) {
    errors.description =
      "Organization description cannot exceed 1000 characters.";
  }

  return errors;
}

function CreateOrganizationPanel() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setFormValues(INITIAL_FORM);
    setIsSlugEdited(false);
    setFieldErrors({});
    setSubmitError("");
  }

  function handleToggle() {
    if (isSubmitting) {
      return;
    }

    if (isOpen) {
      resetForm();
    }

    setIsOpen((currentValue) => !currentValue);
  }

  function handleNameChange(event) {
    const name = event.target.value;

    setFormValues((currentValues) => ({
      ...currentValues,
      name,
      slug: isSlugEdited
        ? currentValues.slug
        : normalizeSlug(name),
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      name: "",
      ...(!isSlugEdited
        ? {
            slug: "",
          }
        : {}),
    }));

    setSubmitError("");
  }

  function handleSlugChange(event) {
    const slug = normalizeSlug(event.target.value);

    setIsSlugEdited(true);

    setFormValues((currentValues) => ({
      ...currentValues,
      slug,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      slug: "",
    }));

    setSubmitError("");
  }

  function handleDescriptionChange(event) {
    const description = event.target.value;

    setFormValues((currentValues) => ({
      ...currentValues,
      description,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      description: "",
    }));

    setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedValues = {
      name: formValues.name.trim(),
      slug: normalizeSlug(formValues.slug || formValues.name),
      description: formValues.description.trim(),
    };

    const validationErrors =
      validateOrganization(normalizedValues);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitError("");

      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitError("");

    try {
      const response = await createOrganization({
        token,
        ...normalizedValues,
      });

      const organizationId =
        response?.organization?.id ||
        response?.organization?._id;

      if (!organizationId) {
        throw new Error(
          "The organization was created, but the server did not return its ID.",
        );
      }

      resetForm();

      navigate(
        `/organizations/${encodeURIComponent(organizationId)}`,
        {
          state: {
            organizationCreated: true,
          },
        },
      );
    } catch (error) {
      setFieldErrors(error?.fields || {});
      setSubmitError(
        error?.message ||
          "The organization could not be created. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const effectiveSlug = normalizeSlug(
    formValues.slug || formValues.name,
  );

  return (
    <section className="organizations__create">
      <div className="organizations__create-header">
        <div>
          <p className="organizations__eyebrow">
            NEW ORGANIZATION
          </p>

          <h2 className="organizations__create-title">
            Create an organization
          </h2>

          <p className="organizations__create-description">
            Establish a new workspace and become its Owner.
          </p>
        </div>

        <button
          className="organizations__create-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls="create-organization-form"
          onClick={handleToggle}
          disabled={isSubmitting}
        >
          {isOpen ? "Cancel" : "Create organization"}
        </button>
      </div>

      {isOpen && (
        <form
          id="create-organization-form"
          className="organizations__create-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {submitError && (
            <p
              className="organizations__create-error"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <div className="organizations__form-grid">
            <div className="organizations__field">
              <label htmlFor="organization-name">
                Organization name
              </label>

              <input
                id="organization-name"
                name="name"
                type="text"
                value={formValues.name}
                minLength={2}
                maxLength={120}
                autoComplete="organization"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={
                  fieldErrors.name
                    ? "organization-name-error"
                    : undefined
                }
                onChange={handleNameChange}
                disabled={isSubmitting}
                placeholder="Example: SkillForge Labs"
              />

              {fieldErrors.name && (
                <span
                  id="organization-name-error"
                  className="organizations__field-error"
                >
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div className="organizations__field">
              <label htmlFor="organization-slug">
                Organization slug
              </label>

              <input
                id="organization-slug"
                name="slug"
                type="text"
                value={formValues.slug}
                minLength={2}
                maxLength={120}
                autoComplete="off"
                spellCheck="false"
                aria-invalid={Boolean(fieldErrors.slug)}
                aria-describedby={
                  fieldErrors.slug
                    ? "organization-slug-error"
                    : "organization-slug-hint"
                }
                onChange={handleSlugChange}
                disabled={isSubmitting}
                placeholder="skillforge-labs"
              />

              {fieldErrors.slug ? (
                <span
                  id="organization-slug-error"
                  className="organizations__field-error"
                >
                  {fieldErrors.slug}
                </span>
              ) : (
                <span
                  id="organization-slug-hint"
                  className="organizations__field-hint"
                >
                  /{effectiveSlug || "your-organization"}
                </span>
              )}
            </div>

            <div className="organizations__field organizations__field--full">
              <div className="organizations__field-heading">
                <label htmlFor="organization-description">
                  Description
                </label>

                <span>
                  {formValues.description.length}/1000
                </span>
              </div>

              <textarea
                id="organization-description"
                name="description"
                value={formValues.description}
                maxLength={1000}
                rows={5}
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={
                  fieldErrors.description
                    ? "organization-description-error"
                    : undefined
                }
                onChange={handleDescriptionChange}
                disabled={isSubmitting}
                placeholder="Describe the organization’s purpose and workspace."
              />

              {fieldErrors.description && (
                <span
                  id="organization-description-error"
                  className="organizations__field-error"
                >
                  {fieldErrors.description}
                </span>
              )}
            </div>
          </div>

          <div className="organizations__create-actions">
            <button
              className="organizations__create-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating organization..."
                : "Create and open workspace"}
            </button>

            <button
              className="organizations__create-cancel"
              type="button"
              onClick={handleToggle}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default CreateOrganizationPanel;
