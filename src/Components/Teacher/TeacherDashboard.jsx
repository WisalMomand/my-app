import React, { useEffect, useState } from "react";
import styles from "./Dishboard.module.css";
import {
  FaPlus,
  FaDatabase,
  FaRegFileAlt,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import CustomQuizForm from "./CustomQuizForm";
import RandomQuizForm from "./RandomQuizForm";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import "../../firebase"; // 🔐 Ensure Firebase is initialized
import "bootstrap/dist/css/bootstrap.min.css";

const TeacherDashboard = () => {
  const [showQuizOptions, setShowQuizOptions] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState("");
  const [teacherName, setTeacherName] = useState("Teacher");
  const [photoURL, setPhotoURL] = useState("default.jpg");
  const navigate = useNavigate();

  // 📥 Handle quiz type selection
  const handleQuizTypeClick = (type) => {
    setSelectedQuizType(type);
    setShowQuizOptions(false);
  };

  // 🔐 Get current teacher info from Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith("@gmail.com")) {
        setTeacherName(user.displayName || user.email);
        setPhotoURL(user.photoURL || "/default.jpg");
      } else {
        alert("Please log in with a valid Gmail account.");
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 🚪 Logout
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        localStorage.clear();
        navigate("/login");
      })
      .catch((err) => {
        console.error("Logout error:", err);
        alert("Failed to log out.");
      });
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>Quiz Maker</h2>
        <nav className={styles.nav}>
          <button
            className={styles.navItem}
            onClick={() => setShowQuizOptions(!showQuizOptions)}
          >
            <FaPlus className={styles.icon} /> Create Quiz
          </button>

          <Link to="/teacher/view-results" className={styles.linkButton}>
            <button className={styles.navItem}>
              <FaRegFileAlt className={styles.icon} /> View Results
            </button>
          </Link>

          <Link to="/teacher/question-bank" className={styles.linkButton}>
            <button className={styles.navItem}>
              <FaQuestionCircle className={styles.icon} /> Question Bank
            </button>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
       <header className={styles.header}>
  <div>
    <p className={styles.welcomeText}>Welcome {teacherName}!</p>
    <span className={styles.role}>Teacher</span>
  </div>

  <div className={styles.profileWrapper}>
    <img src={photoURL} alt="Profile" className={styles.profilePic} />
    <button onClick={handleLogout} className={styles.logoutBtn}>
      <FaSignOutAlt /> Logout
    </button>
  </div>
</header>


        {/* Quiz Buttons */}
        {showQuizOptions && (
          <div className={styles.quizButtons}>
            <button
              className={styles.quizButton}
              onClick={() => handleQuizTypeClick("custom")}
            >
              <FaPlus className={styles.icon} /> Custom Quiz
            </button>
            <button
              className={styles.quizButton}
              onClick={() => handleQuizTypeClick("random")}
            >
              <FaPlus className={styles.icon} /> Random Quiz
            </button>
          </div>
        )}

        {/* Quiz Forms */}
        {selectedQuizType === "custom" && <CustomQuizForm />}
        {selectedQuizType === "random" && <RandomQuizForm />}
      </div>
    </div>
  );
};

export default TeacherDashboard;
