import React, { useState, useEffect } from "react";
import axios from "axios";

const McqManager = () => {
  const [subject, setSubject] = useState("");
  const [mcqs, setMcqs] = useState([]);
  const [subjects, setSubjects] = useState(["OS", "Networking", "DBMS", "AI"]);

  const handleFetch = async (count) => {
    if (!subject) return alert("Please select a subject first!");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/mcqs/${subject}?limit=${count}`
      );
      setMcqs(res.data);
    } catch (error) {
      console.error("Error fetching MCQs:", error);
    }
  };

  const handleDeleteOne = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/mcqs/delete/${id}`);
      setMcqs(mcqs.filter((mcq) => mcq._id !== id));
    } catch (error) {
      console.error("Error deleting MCQ:", error);
    }
  };

  const handleDeleteAll = async () => {
    if (!subject) return alert("Select a subject to delete all its MCQs!");
    try {
      await axios.delete(`http://localhost:5000/api/mcqs/subject/${subject}`);
      setMcqs([]);
    } catch (error) {
      console.error("Error deleting all MCQs:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Manage MCQs by Subject</h2>

      {/* Subject Dropdown */}
      <div className="form-group">
        <label>Select Subject:</label>
        <select
          className="form-control"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((subj, idx) => (
            <option key={idx} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {/* Fetch Buttons */}
      <div className="mt-3">
        <button className="btn btn-primary m-1" onClick={() => handleFetch(10)}>
          Fetch 10 MCQs
        </button>
        <button className="btn btn-primary m-1" onClick={() => handleFetch(20)}>
          Fetch 20 MCQs
        </button>
        <button className="btn btn-primary m-1" onClick={() => handleFetch(30)}>
          Fetch 30 MCQs
        </button>
        <button className="btn btn-danger m-1" onClick={handleDeleteAll}>
          Delete All MCQs from {subject || "Subject"}
        </button>
      </div>

      {/* MCQ List */}
      <div className="mt-4">
        {mcqs.map((mcq) => (
          <div key={mcq._id} className="card mb-2 p-3">
            <strong>Q:</strong> {mcq.question}
            <br />
            <strong>Options:</strong> {mcq.options.join(", ")}
            <br />
            <strong>Correct:</strong> {mcq.correctAnswer}
            <br />
            <button
              className="btn btn-danger btn-sm mt-2"
              onClick={() => handleDeleteOne(mcq._id)}
            >
              Delete
            </button>{" "}
            <button
              className="btn btn-warning btn-sm mt-2"
              onClick={() => alert("Update functionality coming soon")}
            >
              Update
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default McqManager;