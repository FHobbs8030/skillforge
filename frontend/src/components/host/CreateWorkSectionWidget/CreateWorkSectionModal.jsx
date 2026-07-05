import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import "./CreateWorkSectionModal.css";

function CreateWorkSectionModal({
  isOpen,
  formData,
  onChange,
  onSubmit,
  onClose,
}) {
  const dialogRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousActiveElement = document.activeElement;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = previousBodyOverflow;

      previousActiveElement?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="create-work-section-modal__backdrop"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        className="create-work-section-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-work-section-modal-title"
        aria-describedby="create-work-section-modal-description"
        ref={dialogRef}
      >
        <header className="create-work-section-modal__header">
          <div>
            <p className="create-work-section-modal__eyebrow">
              Work Section Draft
            </p>

            <h2
              className="create-work-section-modal__title"
              id="create-work-section-modal-title"
            >
              Create Work Section
            </h2>

            <p
              className="create-work-section-modal__description"
              id="create-work-section-modal-description"
            >
              Define a project section that collaborators can review and claim.
            </p>
          </div>

          <button
            type="button"
            className="create-work-section-modal__close"
            onClick={onClose}
            aria-label="Close create work section dialog"
          >
            ×
          </button>
        </header>

        <form className="create-work-section-modal__form" onSubmit={onSubmit}>
          <div className="create-work-section-modal__body">
            <label className="create-work-section-modal__field">
              <span>Section Title</span>

              <input
                ref={titleInputRef}
                type="text"
                name="title"
                placeholder="Example: User authentication"
                value={formData.title}
                onChange={onChange}
                required
              />
            </label>

            <label className="create-work-section-modal__field">
              <span>Section Goal</span>

              <textarea
                name="goal"
                placeholder="Describe what should be completed and the expected result."
                value={formData.goal}
                onChange={onChange}
                required
              />
            </label>

            <div className="create-work-section-modal__field-row">
              <label className="create-work-section-modal__field">
                <span>Priority</span>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={onChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>

              <label className="create-work-section-modal__field">
                <span>Skills Required</span>

                <input
                  type="text"
                  name="skills"
                  placeholder="React, Express, MongoDB"
                  value={formData.skills}
                  onChange={onChange}
                />
              </label>
            </div>

            <div className="create-work-section-modal__preview-note">
              <strong>Preview mode</strong>

              <p>
                This form creates a temporary local draft only. It does not
                write data to MongoDB or GitHub.
              </p>
            </div>
          </div>

          <footer className="create-work-section-modal__footer">
            <button
              type="button"
              className="button create-work-section-modal__cancel"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button button--primary create-work-section-modal__submit"
            >
              Create Section
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}

export default CreateWorkSectionModal;
