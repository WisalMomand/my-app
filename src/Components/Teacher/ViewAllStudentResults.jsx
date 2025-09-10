import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewAllStudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("Database");
  const [searchTerm, setSearchTerm] = useState(""); // ✅ New state for search

  const teacherId = localStorage.getItem("id"); // Get logged-in teacher ID

  const fetchResults = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:3000/api/quiz-results/result/${teacherId}`
      );
      console.log("Fetched results:", response.data);
      setResults(response.data.results || []);
    } catch (err) {
      console.error("❌ Error fetching results:", err);
      setError("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [subject]);

  // ✅ Filter results by student name (case-insensitive)
  const filteredResults = results.filter((r) =>
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span role="img" aria-label="chart" style={styles.icon}>
          📊
        </span>
        <h2 style={styles.title}>My Subject Results (All Students)</h2>
      </div>

      {/* ✅ Search Bar */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by Student Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Semester</th>
                <th style={styles.th}>Section</th>
                <th style={styles.th}>Quiz Title</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Score</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>%</th>
                <th style={styles.th}>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r, idx) => (
                <tr key={idx} style={styles.tr}>
                  <td style={styles.td}>{r.studentName}</td>
                  <td style={styles.td}>{r.studentEmail}</td>
                  <td style={styles.td}>{r.semester}</td>
                  <td style={styles.td}>{r.section}</td>
                  <td style={styles.td}>{r.quizTitle}</td>
                  <td style={styles.td}>{r.subject}</td>
                  <td style={styles.td}>{r.score}</td>
                  <td style={styles.td}>{r.totalMcqs}</td>
                  <td style={styles.td}>{r.percentage}%</td>
                  <td style={styles.td}>
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan="10" style={styles.noData}>
                    No results found for this student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  icon: {
    fontSize: "28px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  filters: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
    width: "250px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "15px",
    minWidth: "800px",
  },
  th: {
    padding: "12px 16px",
    backgroundColor: "#f2f4f7",
    color: "#333",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "2px solid #e0e0e0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "10px 16px",
    borderBottom: "1px solid #f0f0f0",
    color: "#555",
    whiteSpace: "nowrap",
  },
  tr: {
    transition: "background 0.2s ease-in-out",
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    color: "#888",
  },
  error: {
    color: "red",
    fontWeight: "bold",
    padding: "10px",
    backgroundColor: "#ffebee",
    borderRadius: "6px",
    marginBottom: "15px",
  },
};

export default ViewAllStudentResults;
