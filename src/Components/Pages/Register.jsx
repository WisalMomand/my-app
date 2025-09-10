import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import "./Register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("A");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData = {
        name,
        email,
        role,
        semester: role === "student" ? semester : null,
        section: role === "student" ? section : null,
        photoURL: "default.jpg",
      };

      const res = await axios.post("http://localhost:3000/api/users", userData);
      console.log("User registered:", res);
      const id = res.data.user._id;

        if (res.data.user.status === "pending") {
          setError("Your account is not approved yet. Please wait for admin approval.");
          return;
        }

        localStorage.setItem("id", id);
        localStorage.setItem("email", email);
        localStorage.setItem("role", role);
        localStorage.setItem("name", name);
        localStorage.setItem("semester", semester || "");
        localStorage.setItem("section", section || "");
        localStorage.setItem("photoURL", "/default.jpg");
        localStorage.setItem("status", res.data.user.status);
        alert(" Registration successful!");
        navigate(role === "student" ? "/student-dashboard" : "/teacher-dashboard");
    } catch (err) {
      console.error("Registration error:", err.message);
      setError(" Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-form-container">
        <div className="form-content">
          <h2>Create an Account</h2>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleRegister}>
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            {role === "student" && (
              <>
                <label>Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} required>
                  <option value="">Select Semester</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                  <option value="5th">5th</option>
                  <option value="6th">6th</option>
                  <option value="7th">7th</option>
                  <option value="8th">8th</option>
                </select>

                <label>Section</label>
                <select value={section} onChange={(e) => setSection(e.target.value)}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                   <option value="C">C</option>
                    <option value="D">D</option>
                </select>
              </>
            )}

            <button type="submit">Register</button>
          </form>

          <div className="terms">
            By registering, you agree to our Terms & Privacy.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
