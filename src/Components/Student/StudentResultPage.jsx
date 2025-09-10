import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [studentEmail, setStudentEmail] = useState("");

  // 🔐 Get student email from Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStudentEmail(user.email.toLowerCase()); // ✅ Ensure lowercase
      }
    });
    return () => unsubscribe();
  }, []);

  // 📦 Fetch quiz results for the student
  useEffect(() => {
    if (studentEmail) {
      axios
        .get(`http://localhost:3000/api/student-results/student/${studentEmail}`)
        .then((res) => {
          console.log("📊 Results from API:", res.data);
          setResults(res.data);
        })
        .catch((err) => {
          console.error("❌ Error fetching results:", err);
        });
    }
  }, [studentEmail]);

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "auto" }}>
      <h2 style={{ marginBottom: "20px" }}>📊 Your Quiz Results</h2>

      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        results.map((result, index) => {
          const percentage = ((result.score / result.totalMcqs) * 100).toFixed(0);

          return (
            <div
              key={index}
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h4 style={{ marginBottom: "10px" }}>📘 {result.quizTitle}</h4>
              <p><strong>Subject:</strong> {result.subject}</p>
              <p><strong>Score:</strong> {result.score} / {result.totalMcqs} ({percentage}%)</p>

              <progress
                value={result.score}
                max={result.totalMcqs}
                style={{ width: "100%", height: "20px", marginBottom: "10px" }}
              />

              <p><strong>Date:</strong> {new Date(result.date || result.createdAt).toLocaleString()}</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default StudentResults;



