

import React, { useEffect, useState } from "react";
import styles from "./dishboard.module.css";
import { FaTh, FaRegFileAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../../firebase";
import UserProfile from "../Common/UserProfile";

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [profilePic, setProfilePic] = useState("/default.jpg");
  const [studentName, setStudentName] = useState("");
  const navigate = useNavigate();

  // 🔐 Get current user & photo from Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith("@gmail.com")) {
        setProfilePic(user.photoURL || "/default.jpg");
        localStorage.setItem("photoURL", user.photoURL || "/default.jpg");
      } else {
        alert("Please log in with a valid Gmail account.");
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 📦 Fetch assigned quizzes by semester & section from localStorage
  useEffect(() => {
    const semester = localStorage.getItem("semester");
    const section = localStorage.getItem("section");
    const name = localStorage.getItem("name");

    if (!semester || !section) {
      alert("❌ Missing semester or section info. Please re-login.");
      navigate("/login");
      return;
    }

    setStudentName(name || "Student");

    axios
      .get(`http://localhost:3000/api/assigned-quizzes?semester=${semester}&section=${section}`)
      .then((res) => {
        setQuizzes(res.data);
        console.log("📦 Quizzes received from backend:", res.data);
      })
      .catch((err) => {
        console.error("❌ Failed loading assigned quizzes", err);
        alert("Failed to load assigned quizzes.");
      });
  }, [navigate]);

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>Quiz Maker</h2>
        <nav className={styles.nav}>
          <button className={styles.navItem}>
            <FaTh className={styles.icon} /> Assigned Quizzes
          </button>
          <button className={styles.navItem} onClick={() => navigate("/results")}>
            <FaRegFileAlt className={styles.icon} /> Results
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* ✅ Student Profile Header with Dynamic Photo */}
        <UserProfile
          email={studentName}
          role="Student"
          image={profilePic}
        />

        {/* Quiz Section */}
        <div className={styles.quizSection}>
          {quizzes.length === 0 ? (
            <p>No quizzes assigned to your semester/section yet.</p>
          ) : (
            quizzes.map((quiz, index) => (
              <div key={quiz._id} className={styles.quizContainer}>
                <div className={styles.quizCard}>
                  <span>{quiz.title}</span>
                 
                </div>

                {index === 0 && <hr className={styles.divider} />}

                <div className={styles.quizDetails}>
                  <span><strong>Deadline:</strong> {quiz.deadline}</span>
                  <span><strong>Time Duration:</strong> {quiz.duration} min</span>
                  <span><strong>Subject:</strong> {quiz.subject}</span>
                  <button
                    className={styles.startBtn}
                    onClick={() => navigate(`/start-quiz/${quiz._id}`)}
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;







