import React, { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showReset, setShowReset] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();

  const fetchAndStoreUserDetails = async (userEmail, userPhotoURL) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/users/${userEmail}`);
      const userData = res.data;

      if (userData.status === "pending") {
        setError("Your account is not approved yet. Please wait for admin approval.");
        return;
      }

      storeUserLocally(userData, userPhotoURL);
      navigate(userData.role === "student" ? "/student-dashboard" : "/teacher-dashboard");
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const newUser = {
          uid: auth.currentUser.uid,
          email: userEmail,
          name: "New User",
          role,
          semester: role === "student" ? "1st" : null,
          section: role === "student" ? "A" : null,
          photoURL: userPhotoURL || "/default.jpg",
        };

        const createRes = await axios.post("http://localhost:3000/api/users", newUser);
        const userData = createRes.data;

        if (userData.status === "pending") {
          setError("Your account is not approved yet. Please wait for admin approval.");
          return;
        }

        storeUserLocally(userData, userPhotoURL);
        navigate(userData.role === "student" ? "/student-dashboard" : "/teacher-dashboard");
      } else {
        console.error("User fetch error:", err.message);
        setError("❌ Failed to fetch user.");
      }
    }
  };

  const storeUserLocally = (userData, userPhotoURL) => {
    localStorage.setItem("id", userData._id);
    localStorage.setItem("email", userData.email);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("name", userData.name || "");
    localStorage.setItem("semester", userData.semester || "");
    localStorage.setItem("section", userData.section || "");
    localStorage.setItem("photoURL", userPhotoURL || "/default.jpg");
    alert("✅ Login successful!");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await fetchAndStoreUserDetails(user.email, user.photoURL);
    } catch (err) {
      console.error("Login error:", err.message);
      setError("❌ Email or password is incorrect.");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email.endsWith("@gmail.com")) {
        setError("❌ Only Gmail accounts are allowed.");
        return;
      }

      await fetchAndStoreUserDetails(user.email, user.photoURL);
    } catch (err) {
      console.error("Google login error:", err.message);
      setError("❌ Google login failed.");
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError("⚠️ Enter email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert("✅ Password reset email sent.");
      setShowReset(false);
    } catch (err) {
      console.error("Reset error:", err.message);
      setError("❌ Failed to send reset email.");
    }
  };

  return (
    <div className={styles.centerWrapper}>
      <div className={styles.loginContainer}>
        <h2>
          Sign in to <br />
          <strong>Generate Quiz</strong>
        </h2>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <p className={styles.forgot} onClick={() => setShowReset(!showReset)}>
            Forgot Password?
          </p>

          {showReset && (
            <div>
              <input
                type="email"
                placeholder="Enter email to reset"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <button type="button" onClick={handleResetPassword}>
                Send Reset Link
              </button>
            </div>
          )}

          <button type="submit" className={styles.loginButton}>
            Log in
          </button>

          {/* <button
            type="button"
            className={styles.loginButton}
            onClick={handleGoogleLogin}
            style={{ backgroundColor: "#4285F4", marginTop: "10px" }}
          >
            Sign in with Google
          </button> */}
        </form>
      </div>
    </div>
  );
};

export default Login;

