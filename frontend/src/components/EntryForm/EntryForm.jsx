import "./EntryForm.css";

function EntryForm({ formData, handleChange, handleSubmit }) {
  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          name="topic"
          placeholder="Topic"
          value={formData.topic}
          onChange={handleChange}
        />
        <input
          type="number"
          name="hours"
          placeholder="Hours"
          value={formData.hours}
          onChange={handleChange}
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <input
          type="text"
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <button type="submit" className="add-btn">
        Add Entry
      </button>
    </form>
  );
}

export default EntryForm;
