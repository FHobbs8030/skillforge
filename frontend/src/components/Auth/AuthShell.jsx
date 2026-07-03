import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import "./AuthShell.css";

const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function AuthShell({ eyebrow, title, description, children, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus({
      preventScroll: true,
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll(FOCUSABLE_ELEMENTS),
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus({
          preventScroll: true,
        });
      }
    };
  }, [onClose]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const authDialog = (
    <div
      className="auth-shell"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <section
        ref={dialogRef}
        className="auth-shell__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-shell-title"
        aria-describedby="auth-shell-description"
      >
        <div className="auth-shell__toolbar">
          <button
            ref={closeButtonRef}
            className="auth-shell__close"
            type="button"
            aria-label="Close account form"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="auth-shell__header">
          <p className="auth-shell__eyebrow">{eyebrow}</p>

          <h1 id="auth-shell-title" className="auth-shell__title">
            {title}
          </h1>

          <p id="auth-shell-description" className="auth-shell__description">
            {description}
          </p>
        </div>

        <div className="auth-shell__content">{children}</div>
      </section>
    </div>
  );

  return createPortal(authDialog, document.body);
}

export default AuthShell;
