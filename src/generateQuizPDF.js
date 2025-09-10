import jsPDF from "jspdf";


const normalize = (str) =>
  str?.replace(/\(.\)\s*/, "").trim().toLowerCase();

const generateQuizPDF = (quiz, answers, studentEmail) => {
  const doc = new jsPDF();
  let y = 10;
  let score = 0;

  doc.setFontSize(14);
  doc.text("Quiz Report", 80, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`Student: ${studentEmail}`, 10, y);
  y += 6;
  doc.text(`Quiz Title: ${quiz.title}`, 10, y);
  y += 6;
  doc.text(`Subject: ${quiz.subject}`, 10, y);
  y += 6;
  const submittedTime = new Date().toLocaleString();
  doc.text(`Submitted At: ${submittedTime}`, 10, y);
  y += 10;

  quiz.mcqs.forEach((mcq, index) => {
    const selected = answers[mcq._id] || "Not Answered";
    const isCorrect =
      normalize(selected) === normalize(mcq.correctAnswer);

    if (isCorrect) score += 1;

    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${mcq.question}`, 10, y);
    y += 6;

    doc.setFont("helvetica", "normal");

    doc.text(`Your Answer: ${selected}`, 12, y);
    y += 6;

    if (isCorrect) {
      doc.setTextColor(0, 150, 0); // green
      doc.text("✅ Correct", 12, y);
    } else {
      doc.setTextColor(200, 0, 0); // red
      doc.text(`✘ Wrong | Correct Answer: ${mcq.correctAnswer}`, 12, y);
    }

    doc.setTextColor(0, 0, 0);
    y += 10;

    // Page break if needed
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  // ✅ Summary
  const total = quiz.mcqs.length;
  const percentage = Math.round((score / total) * 100);
  const result = percentage >= 50 ? "✅ Passed" : "❌ Failed";

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text(`Total Score: ${score} / ${total}`, 10, y);
  y += 6;
  doc.text(`Percentage: ${percentage}%`, 10, y);
  y += 6;
  doc.text(`Result: ${result}`, 10, y);

  // ✅ Save file
  doc.save(`QuizReport_${quiz.title}_${studentEmail}.pdf`);
};

export default generateQuizPDF;

