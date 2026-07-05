import { useCallback, useState } from "react";

import CreateWorkSectionModal from "./CreateWorkSectionModal";

import "./CreateWorkSectionWidget.css";

const initialFormData = {
  title: "",
  goal: "",
  priority: "medium",
  skills: "",
};

function CreateWorkSectionWidget() {
  const [formData, setFormData] = useState(initialFormData);
  const [feedback, setFeedback] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setFeedback("");
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    setFeedback("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setFeedback(
      `Draft "${formData.title}" was created locally for visual testing.`,
    );

    setFormData(initialFormData);
    setIsModalOpen(false);
  };

  return (
    <>
      <article className="create-section-widget">
        <header className="create-section-widget__header">
          <div>
            <p className="create-section-widget__eyebrow">
              Primary Host Action
            </p>

            <h2 className="create-section-widget__title">
              Create Work Section
            </h2>
          </div>

          <span className="create-section-widget__badge">Draft Builder</span>
        </header>

        <p className="create-section-widget__description">
          Define a focused piece of project work that collaborators can review
          and claim.
        </p>

        <div className="create-section-widget__summary">
          <div className="create-section-widget__summary-item">
            <span className="create-section-widget__summary-label">
              Section details
            </span>

            <strong>Title, goal, priority, and required skills</strong>
          </div>

          <div className="create-section-widget__summary-item">
            <span className="create-section-widget__summary-label">
              Preview behavior
            </span>

            <strong>Creates a temporary local draft</strong>
          </div>
        </div>

        <button
          type="button"
          className="button button--primary create-section-widget__button"
          onClick={handleOpenModal}
          aria-haspopup="dialog"
        >
          <span
            className="create-section-widget__button-icon"
            aria-hidden="true"
          >
            +
          </span>
          Create Work Section
        </button>

        {feedback && (
          <p
            className="create-section-widget__feedback"
            role="status"
            aria-live="polite"
          >
            {feedback}
          </p>
        )}
      </article>

      <CreateWorkSectionModal
        isOpen={isModalOpen}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default CreateWorkSectionWidget;
