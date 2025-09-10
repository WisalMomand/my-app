import React, { useState, useEffect } from "react";
import axios from "axios";

const MCQForm = ({ editingMcq, onClose }) => {
  const [form, setForm] = useState({
    subject: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  useEffect(() => {
    if (editingMcq) {
      setForm(editingMcq);
    }
  }, [editingMcq]);

  const handleChange = (e, index = null) => {
    if (index !== null) {
      const updatedOptions = [...form.options];
      updatedOptions[index] = e.target.value;
      setForm({ ...form, options: updatedOptions });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMcq) {
        await axios.put(`http://localhost:3000/api/mcqs/${editingMcq._id}`, form);
      } else {
        await axios.post("http://localhost:3000/api/mcqs", form);
      }
      onClose();
    } catch (err) {
      console.error("❌ Error saving MCQ:", err);
    }
  };

  return (
    <div style={styles.popup}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>{editingMcq ? "✏️ Edit Question" : "➕ Add New Question"}</h3>

        <label>Subject:</label>
        <input name="subject" value={form.subject} onChange={handleChange} required />

        <label>Question:</label>
        <textarea name="question" value={form.question} onChange={handleChange} required />

        <label>Options:</label>
        {form.options.map((opt, idx) => (
          <input
            key={idx}
            value={opt}
            onChange={(e) => handleChange(e, idx)}
            placeholder={`Option ${idx + 1}`}
            required
          />
        ))}

        <label>Correct Answer:</label>
        <input
          name="correctAnswer"
          value={form.correctAnswer}
          onChange={handleChange}
          required
        />

        <div style={styles.buttons}>
          <button type="submit" style={styles.saveBtn}>💾 Save</button>
          <button onClick={onClose} style={styles.cancelBtn}>❌ Cancel</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  popup: {
    background: "#f9f9f9",
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  buttons: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  saveBtn: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelBtn: {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default MCQForm;
