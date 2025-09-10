import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./StartQuiz.module.css";
import generateQuizPDF from "../../generateQuizPDF";

const StartQuiz = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [teacherId, setTeacherId] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/assigned-quizzes/${quizId}`);
        const quizData = res.data;
        setTeacherId(quizData.teacherid);

        const mcqsArray = quizData?.mcqs || quizData?.quiz?.mcqs || [];
        if (!Array.isArray(mcqsArray) || mcqsArray.length === 0) {
          setErrorMsg("No MCQs found in this quiz.");
          return;
        }

        const quizTitle = quizData?.title || quizData?.quizTitle || "Untitled Quiz";

        setQuiz({
          ...quizData,
          title: quizTitle,
          mcqs: mcqsArray,
        });

        setTimeLeft((quizData?.duration || 0) * 60);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setErrorMsg(" Error fetching quiz. Please try again later.");
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz || submitted || !timeLeft) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz, submitted, timeLeft]);

  useEffect(() => {
    if (showInstructions || submitted) return;

    const handleBeforeUnload = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? Quiz will be auto-submitted.";
      }
    };

    const handlePopState = () => {
      if (!submitted) {
        alert(" Back button is disabled during the quiz.");
        window.history.pushState(null, null, window.location.href);
      }
    };

    const handleBlur = () => {
      if (!submitted) {
        alert(" You switched tabs or minimized the window. Quiz has been auto-submitted.");
        handleSubmit();
      }
    };

    const disableKeys = (e) => {
      if (
        (e.ctrlKey && ["t", "n", "w", "r"].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && e.key === "N") ||
        e.key === "F12"
      ) {
        e.preventDefault();
        alert(" Keyboard shortcuts are disabled during the quiz.");
      }
    };

    const disableRightClick = (e) => e.preventDefault();

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("keydown", disableKeys);
    window.addEventListener("contextmenu", disableRightClick);
    window.history.pushState(null, null, window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", disableKeys);
      window.removeEventListener("contextmenu", disableRightClick);
    };
  }, [submitted, showInstructions]);

  const handleOptionChange = (mcqId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [mcqId]: selectedOption,
    }));
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    setErrorMsg("");

    const studentEmail = localStorage.getItem("email");
    const studentName = localStorage.getItem("name");

    if (!studentEmail || !studentName) {
      setErrorMsg(" Missing student email or name in localStorage.");
      return;
    }

    const normalize = (str) => str?.replace(/\(.\)\s*/, "").trim().toLowerCase();

    let score = 0;
    const answerDetails = quiz.mcqs.map((mcq) => {
      const selected = answers[mcq._id] || "Not answered";
      const correct = mcq.correctAnswer;
      if (normalize(selected) === normalize(correct)) score++;

      return {
        question: mcq.question,
        selected,
        correct,
      };
    });

    const percentage = Math.round((score / quiz.mcqs.length) * 100);

    try {
  
      await axios.post("http://localhost:3000/api/quiz-results", {
        teacherId,
        studentName,
        studentEmail,
        semester: quiz.semester,
        section: quiz.section,
        quizTitle: quiz.title, 
        subject: quiz.subject,
        score,
        totalMcqs: quiz.mcqs.length,
        percentage,
        answers: answerDetails,
        teacherEmail: quiz.teacherEmail,
        teacherName: quiz.teacherName,
      });

    
      await axios.post("http://localhost:3000/api/student-results/submit", {
        studentEmail,
        quizTitle: quiz.title,
        subject: quiz.subject,
        score,
        totalMcqs: quiz.mcqs.length,
        answers: answerDetails.map((a) => ({
          question: a.question,
          selectedAnswer: a.selected,
          correctAnswer: a.correct,
          isCorrect: normalize(a.selected) === normalize(a.correct),
        })),
      });

      console.log(" Results submitted to both Teacher and Student endpoints.");
    } catch (err) {
      console.error(" Failed to submit quiz:", err);
      setErrorMsg(" Failed to submit quiz result.");
    }
  };

  const totalMcqs = quiz?.mcqs?.length || 0;
  const attempted = Object.keys(answers).filter((key) => answers[key] !== undefined).length;
  const progress = totalMcqs ? Math.round((attempted / totalMcqs) * 100) : 0;

  if (errorMsg) return <p style={{ color: "red" }}>{errorMsg}</p>;
  if (!quiz) return <p>Loading quiz...</p>;

  if (showInstructions) {
    return (
      <div className={styles.container}>
        <h2> Quiz Instructions</h2>
        <ul>
          <li> Do not switch tabs or minimize. It will auto-submit and mark you failed.</li>
          <li>Avoid Back/Refresh/DevTools. They are disabled.</li>
          <li>Time starts after clicking "Start Quiz".</li>
        </ul>
        <button className={styles.submitBtn} onClick={() => setShowInstructions(false)}>
          Start Quiz
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.progressBarWrapper}>
        <div className={styles.progressText}>Progress: {progress}%</div>
        <div className={styles.progressBarOuter}>
          <div className={styles.progressBarInner} style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <h3>{quiz.title}</h3>
      <p>
        <strong>Time Left:</strong> {Math.floor(timeLeft / 60)}:
        {String(timeLeft % 60).padStart(2, "0")}
      </p>

      {quiz.mcqs.map((mcq, idx) => (
        <div key={mcq._id} className={styles.questionCard}>
          <p>
            <strong>
              {idx + 1}. {mcq.question}
            </strong>
          </p>
          {mcq.options.map((opt, i) => (
            <label key={i} className={styles.option}>
              <input
                type="radio"
                name={mcq._id}
                value={opt}
                checked={answers[mcq._id] === opt}
                onChange={() => handleOptionChange(mcq._id, opt)}
                disabled={submitted}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitted}>
        {submitted ? "Submitted" : "Submit"}
      </button>

      {submitted && (
        <button
          className={styles.submitBtn}
          onClick={() => generateQuizPDF(quiz, answers, localStorage.getItem("email"))}
        >
          Download Report
        </button>
      )}
    </div>
  );
};

export default StartQuiz;

