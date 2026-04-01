import "./EntryForm.css";

function EntryForm({ formData, handleChange, handleSubmit }) {
  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <div className="entry-form__row">
        <input
          className="entry-form__input"
          type="text"
          name="topic"
          placeholder="Topic"
          value={formData.topic}
          onChange={handleChange}
        />
        <input
          className="entry-form__input"
          type="number"
          name="hours"
          placeholder="Hours"
          value={formData.hours}
          onChange={handleChange}
        />
        <input
          className="entry-form__input"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
      </div>

      <div className="entry-form__row">
        <input
          className="entry-form__input entry-form__input--full"
          type="text"
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="button button--primary entry-form__button"
      >
        Add Entry
      </button>
    </form>
  );
}

export default EntryForm;
