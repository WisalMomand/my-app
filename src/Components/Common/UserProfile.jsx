import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const UserProfile = ({ email, role = "Student", image = null }) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(localStorage.getItem("photoURL") || "/default.jpg");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.photoURL) {
        setProfileImage(user.photoURL);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // clear token/role/email
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <div>
        <p style={styles.welcomeText}>Welcome {email}!</p>
        <span style={styles.role}>{role}</span>
      </div>
      <div style={styles.right}>
        <img src={profileImage} alt="Profile" style={styles.profilePic} />
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: "10px 20px",
    borderBottom: "1px solid #ccc",
  },
  welcomeText: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
  },
  role: {
    fontSize: "14px",
    color: "#666",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  profilePic: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  logoutBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  }
};

export default UserProfile;
