import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import styles from "./QuizForm.module.css";
import { BASE_URL } from "../../../../constant";

const CustomQuizForm = () => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [numberOfMcqs, setNumberOfMcqs] = useState(5);
  const [timePerMcq, setTimePerMcq] = useState(1);
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [availableMcqs, setAvailableMcqs] = useState([]);
  const [selectedMcqIds, setSelectedMcqIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
  const sections = ["A", "B", "C", "D"];

  // ✅ Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/subjects`);
        const fetchedSubjects = res.data.map((s) => s.name);
        setSubjects(fetchedSubjects);
      } catch (err) {
        console.error("❌ Error fetching subjects:", err);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, []);

  // ✅ Fetch MCQs for selected subject
  useEffect(() => {
    const fetchMcqs = async () => {
      if (!subject) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/mcqs/subject/${subject}`);
        setAvailableMcqs(res.data);
      } catch (err) {
        console.error("❌ Error fetching MCQs:", err);
        setAvailableMcqs([]);
      }
    };
    fetchMcqs();
  }, [subject]);

  const handleMcqSelect = (id) => {
    if (selectedMcqIds.includes(id)) {
      setSelectedMcqIds((prev) => prev.filter((mcqId) => mcqId !== id));
    } else {
      setSelectedMcqIds((prev) => [...prev, id]);
    }
  };

  // ✅ Generate PDF before submission
  const generateQuizPDF = () => {
    if (!title || !subject || selectedMcqIds.length === 0) {
      alert("Please fill all required fields and select MCQs before downloading.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Custom Quiz (Preview)", 105, 15, null, null, "center");

    doc.setFontSize(12);
    doc.text(`Title: ${title}`, 14, 30);
    doc.text(`Subject: ${subject}`, 14, 38);
    doc.text(`Semester: ${semester} | Section: ${section}`, 14, 46);
    doc.text(`Deadline: ${deadline}`, 14, 54);
    doc.text(`Number of MCQs: ${numberOfMcqs}`, 14, 62);
    doc.text(`Duration: ${numberOfMcqs * timePerMcq} mins`, 14, 70);

    let y = 85;
    const selectedQuestions = availableMcqs.filter((mcq) =>
      selectedMcqIds.includes(mcq._id)
    );

    selectedQuestions.forEach((mcq, index) => {
      doc.text(`${index + 1}. ${mcq.question}`, 14, y);
      y += 8;

      mcq.options.forEach((opt) => {
        doc.text(`   ${opt}`, 14, y);
        y += 6;
      });

      y += 4;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`${title || "Custom_Quiz"}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parsedNum = parseInt(numberOfMcqs);
    const parsedTime = parseInt(timePerMcq);
    const duration = parsedNum * parsedTime;

    if (!title || !subject || !deadline || !semester || !section || parsedNum <= 0 || parsedTime <= 0) {
      alert("🚫 Please fill all fields correctly.");
      setIsSubmitting(false);
      return;
    }

    if (selectedMcqIds.length !== parsedNum) {
      alert(`🚫 Please select exactly ${parsedNum} MCQs.`);
      setIsSubmitting(false);
      return;
    }

    const teacherid = localStorage.getItem("id");
    if (!teacherid) {
      alert("🚫 Teacher ID not found in localStorage.");
      setIsSubmitting(false);
      return;
    }

    const quizData = {
      title,
      subject,
      type: "custom",
      numberOfMcqs: parsedNum,
      duration,
      deadline,
      semester,
      section,
      mcqs: selectedMcqIds,
    };

    try {
      const res = await axios.post(`${BASE_URL}/api/quizzes/custom/${teacherid}`, quizData);
      alert("✅ Custom Quiz Assigned Successfully!");
      console.log("✅ Quiz Saved:", res.data);

      setTitle("");
      setSubject("");
      setDeadline("");
      setNumberOfMcqs(5);
      setTimePerMcq(1);
      setSemester("");
      setSection("");
      setSelectedMcqIds([]);
    } catch (error) {
      console.error("❌ Error assigning quiz:", error);
      alert("❌ Failed to assign quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Create Custom Quiz</h3>

      <input
        type="text"
        placeholder="Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <select value={subject} onChange={(e) => setSubject(e.target.value)} required>
        <option value="">-- Select Subject --</option>
        {subjects.map((subj) => (
          <option key={subj} value={subj}>
            {subj}
          </option>
        ))}
      </select>

      <select value={semester} onChange={(e) => setSemester(e.target.value)} required>
        <option value="">-- Select Semester --</option>
        {semesters.map((sem) => (
          <option key={sem} value={sem}>
            {sem}
          </option>
        ))}
      </select>

      <select value={section} onChange={(e) => setSection(e.target.value)} required>
        <option value="">-- Select Section --</option>
        {sections.map((sec) => (
          <option key={sec} value={sec}>
            {sec}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Number of MCQs"
        value={numberOfMcqs}
        onChange={(e) => setNumberOfMcqs(e.target.value)}
        required
        min={1}
      />

      <input
        type="number"
        placeholder="Time per MCQ (minutes)"
        value={timePerMcq}
        onChange={(e) => setTimePerMcq(e.target.value)}
        required
        min={1}
      />

      <div className={styles.mcqList}>
        <h4>Select MCQs</h4>
        {availableMcqs.length === 0 ? (
          <p>No MCQs found for selected subject.</p>
        ) : (
          availableMcqs.map((mcq) => (
            <label key={mcq._id}>
              <input
                type="checkbox"
                checked={selectedMcqIds.includes(mcq._id)}
                onChange={() => handleMcqSelect(mcq._id)}
              />
              {mcq.question}
            </label>
          ))
        )}
      </div>

      {/* ✅ Download PDF Button */}
      <button
        type="button"
        onClick={generateQuizPDF}
        disabled={selectedMcqIds.length === 0}
      >
        Download Quiz PDF
      </button>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Assigning..." : "Assign Custom Quiz"}
      </button>
    </form>
  );
};

export default CustomQuizForm;
