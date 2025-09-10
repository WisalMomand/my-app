import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./QuestionBank.module.css";

const QuestionBank = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [mcqs, setMcqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [editingMcqId, setEditingMcqId] = useState(null);

  const BASE_URL = "http://localhost:3000";

  // ✅ Static old subjects
  const oldSubjects = [
    // "Operating System",
    // "Networking",
    // "Software Engineering",
    // "Database",
    // "Artificial Intelligence",
    // "Data Structure",
    // "Web Development",
  ];

  // ✅ Load and merge subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/subjects`);
        const fetchedSubjects = res.data.map((s) => s.name);
        const combined = [...new Set([...oldSubjects, ...fetchedSubjects])];
        setSubjects(combined);
      } catch (err) {
        console.error("❌ Failed to load subjects:", err);
        setSubjects(oldSubjects); // fallback
      }
    };
    fetchSubjects();
  }, []);

  // ✅ Load MCQs when subject changes
  useEffect(() => {
    if (selectedSubject) fetchMcqs();
  }, [selectedSubject]);

  // ✅ Fetch MCQs for selected subject
  const fetchMcqs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/mcqs/subject/${selectedSubject}`);
      setMcqs(res.data);
    } catch (err) {
      console.error("Failed to fetch MCQs:", err);
    }
  };

  // ✅ Add new subject
  const handleAddSubject = async () => {
    const name = newSubject.trim();
    if (!name) return alert("Subject name is required.");

    try {
      await axios.post(`${BASE_URL}/api/subjects`, { name });
      alert("✅ Subject added!");
      setNewSubject("");
      setSubjects((prev) => [...new Set([...prev, name])]); 
      setSelectedSubject(name); 
    } catch (err) {
      console.error("❌ Error adding subject:", err);
      alert("Subject may already exist.");
    }
  };

  // ✅ Add or Update MCQ
  const handleAddOrUpdate = async () => {
    if (!question || options.some((opt) => !opt.trim()) || !correctAnswer.trim()) {
      alert("Please fill all fields.");
      return;
    }

    const newMcq = {
      subject: selectedSubject,
      question,
      options: options.map((opt, i) => `  (${String.fromCharCode(97 + i)}) ${opt}`),
      correctAnswer,
    };

    try {
      if (editingMcqId) {
        await axios.put(`${BASE_URL}/api/mcqs/${editingMcqId}`, newMcq);
        alert("✅ MCQ updated.");
      } else {
        await axios.post(`${BASE_URL}/api/mcqs`, newMcq);
        alert("✅ MCQ added.");
      }
      resetForm();
      fetchMcqs();
    } catch (err) {
      console.error("❌ Error saving MCQ:", err);
    }
  };

  // ✅ Edit MCQ
  const handleEdit = (mcq) => {
    setEditingMcqId(mcq._id);
    setQuestion(mcq.question);
    setOptions(mcq.options.map((opt) => opt.replace(/^ *\([a-d]\) */, "")));
    setCorrectAnswer(mcq.correctAnswer);
  };

  // ✅ Delete MCQ
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/mcqs/${id}`);
      fetchMcqs();
    } catch (err) {
      console.error("❌ Error deleting MCQ:", err);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setEditingMcqId(null);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🧠 Question Bank</h2>

      {/* Add Subject */}
      <div className={styles.subjectAdder}>
        <input
          type="text"
          placeholder="Enter new subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleAddSubject} className={styles.addSubjectBtn}>
          ➕ Add Subject
        </button>
      </div>

      {/* Subject Selector */}
      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className={styles.select}
      >
        <option value="">-- Select Subject --</option>
        {subjects.map((subj) => (
          <option key={subj} value={subj}>
            {subj}
          </option>
        ))}
      </select>

      {/* MCQ Form & List */}
      {selectedSubject && (
        <>
          <div className={styles.form}>
            <input
              type="text"
              placeholder="Enter Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={styles.input}
            />
            {options.map((opt, i) => (
              <input
                key={i}
                type="text"
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                value={opt}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[i] = e.target.value;
                  setOptions(newOptions);
                }}
                className={styles.input}
              />
            ))}
            <input
              type="text"
              placeholder="Correct Answer (e.g., (a) Option A)"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className={styles.input}
            />
            <button onClick={handleAddOrUpdate} className={styles.button}>
              {editingMcqId ? "Update MCQ" : "Add MCQ"}
            </button>
            {editingMcqId && (
              <button onClick={resetForm} className={styles.cancelButton}>
                Cancel
              </button>
            )}
          </div>

          {/* MCQ Table */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Question</th>
                <th>Options</th>
                <th>Correct</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mcqs.map((mcq) => (
                <tr key={mcq._id}>
                  <td>{mcq.question}</td>
                  <td>
                    <ul>
                      {mcq.options.map((opt, idx) => (
                        <li key={idx}>{opt}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{mcq.correctAnswer}</td>
                  <td>
                    <button onClick={() => handleEdit(mcq)} className={styles.editBtn}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(mcq._id)} className={styles.deleteBtn}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default QuestionBank;





