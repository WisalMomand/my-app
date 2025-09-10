import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Login from "./Components/Pages/Login";
import Register from "./Components/Pages/Register";
import TeacherDashboard from "./Components/Teacher/TeacherDashboard";
import StudentDashboard from "./Components/Student/StudentDishboard";
import McqManager from "./Components/McqManager";
import StartQuiz from "./Components/Student/StartQuiz";
import StudentResultPage from "./Components/Student/StudentResultPage";
import ViewAllStudentResults from "./Components/Teacher/ViewAllStudentResults";
import QuestionBank from "./Components/Teacher/QuestionBank";

// Inside <Routes>


const App = () => {
  return (
    <Router>
      <Routes>
        {/* ✅ Redirect root path to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />

        {/* Teacher Functional Pages */}
        <Route path="/question-bank" element={<McqManager />} />

        {/* Student Functional Pages */}
        <Route path="/start-quiz/:quizId" element={<StartQuiz />} />
        <Route path="/results" element={<StudentResultPage />} />
        <Route path="/teacher/view-results" element={<ViewAllStudentResults />} />
        
        <Route path="/teacher/question-bank" element={<QuestionBank />} />

        {/* Redirect any unknown paths to Login */}

      </Routes>
    </Router>
  );
};

export default App;


