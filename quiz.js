/* =========================================
   SKILLPILOT AI - INTERACTIVE QUIZ ENGINE
========================================= */

const generateBtn = document.getElementById("generateBtn");
const quizConfig = document.getElementById("quizConfig");
const loadingSection = document.getElementById("loadingSection");
const quizSection = document.getElementById("quizSection");
const resultSection = document.getElementById("resultSection");

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let selectedSubject = "";
let selectedTopic = "";
let selectedDifficulty = "";

/* =========================================
   AUTO-INITIALIZE FROM LOCALSTORAGE
   (When coming from learning.html)
========================================= */
document.addEventListener("DOMContentLoaded", () => {
    try {
        const storedQuiz = localStorage.getItem("generatedQuiz");
        const storedSettings = localStorage.getItem("skillPilotQuiz");

        if (storedQuiz) {
            const parsed = JSON.parse(storedQuiz);
            if (Array.isArray(parsed) && parsed.length > 0) {
                console.log("Loaded generated quiz from localStorage:", parsed);
                questions = parsed;

                if (storedSettings) {
                    const settings = JSON.parse(storedSettings);
                    selectedSubject = settings.subject || "Domain Knowledge";
                    selectedTopic = settings.topic || "Core Concepts";
                    selectedDifficulty = settings.difficulty || "Beginner";
                } else {
                    selectedSubject = "Domain Assessment";
                    selectedTopic = "Core Concepts";
                    selectedDifficulty = "Standard";
                }

                startQuizDisplay();
                return;
            }
        }
    } catch (err) {
        console.warn("Could not load stored quiz:", err);
    }

    // Default view: Show configuration if no quiz pre-loaded
    if (quizConfig) quizConfig.style.display = "block";
    if (loadingSection) loadingSection.style.display = "none";
    if (quizSection) quizSection.style.display = "none";
    if (resultSection) resultSection.style.display = "none";
});

/* =========================================
   GENERATE QUIZ (Directly from quiz page)
========================================= */
if (generateBtn) {
    generateBtn.addEventListener("click", async function () {
        const subjectEl = document.getElementById("subject");
        const topicEl = document.getElementById("topic");
        const difficultyEl = document.getElementById("difficulty");
        const questionCountEl = document.getElementById("questionCount");

        const subject = subjectEl ? subjectEl.value.trim() : "";
        const topic = topicEl ? topicEl.value.trim() : "";
        const difficulty = difficultyEl ? difficultyEl.value : "Beginner";
        const questionCount = questionCountEl ? questionCountEl.value : "5";

        if (!subject) {
            alert("Please select a domain / subject.");
            return;
        }

        if (!topic) {
            alert("Please enter a specific topic.");
            return;
        }

        selectedSubject = subject;
        selectedTopic = topic;
        selectedDifficulty = difficulty;

        // Show loading screen
        if (quizConfig) quizConfig.style.display = "none";
        if (loadingSection) loadingSection.style.display = "block";
        if (quizSection) quizSection.style.display = "none";
        if (resultSection) resultSection.style.display = "none";

        
        try {
    const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            subject,
            topic,
            difficulty,
            numberOfQuestions: Number(questionCount)
        })
    });

    const responseText = await response.text();

    console.log("Raw server response:", responseText);

    let data;

    try {
        data = JSON.parse(responseText);
    } catch (error) {
        throw new Error(
            "Server returned invalid JSON. Please check server.js."
        );
    }

    if (!response.ok) {
        throw new Error(data.error || "Server error occurred.");
    }

    console.log("Server response:", data);

    const fetchedQuestions = data.quiz || data.questions;

    console.log("Questions received:", fetchedQuestions);

    if (
        !Array.isArray(fetchedQuestions) ||
        fetchedQuestions.length === 0
    ) {
        throw new Error(
            "Questions were not returned by the server."
        );
    }

    questions = fetchedQuestions;

    localStorage.setItem(
        "generatedQuiz",
        JSON.stringify(questions)
    );

    localStorage.setItem(
        "skillPilotQuiz",
        JSON.stringify({
            subject,
            topic,
            difficulty,
            questions: questions.length
        })
    );

    startQuizDisplay();

} catch (error) {
    console.error("Quiz generation error:", error);

    if (loadingSection) {
        loadingSection.style.display = "none";
    }

    if (quizConfig) {
        quizConfig.style.display = "block";
    }

    alert("Unable to generate quiz: " + error.message);
}
   });
}

/* =========================================
   START & DISPLAY QUIZ
========================================= */
function startQuizDisplay() {
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);

    if (quizConfig) quizConfig.style.display = "none";
    if (loadingSection) loadingSection.style.display = "none";
    if (resultSection) resultSection.style.display = "none";
    if (quizSection) quizSection.style.display = "block";

    const quizSubEl = document.getElementById("quizSubject");
    const quizTopEl = document.getElementById("quizTopic");
    const totalQEl = document.getElementById("totalQuestions");

    if (quizSubEl) quizSubEl.textContent = selectedSubject || "Knowledge Assessment";
    if (quizTopEl) quizTopEl.textContent = `${selectedTopic || "Core Concepts"} • ${selectedDifficulty || "Beginner"}`;
    if (totalQEl) totalQEl.textContent = questions.length;

    showQuestion();
}

/* =========================================
   SHOW QUESTION
========================================= */
function showQuestion() {
    const q = questions[currentQuestionIndex];
    if (!q) return;

    const currentQEl = document.getElementById("currentQuestion");
    const qTextEl = document.getElementById("questionText");
    const optionsContainer = document.getElementById("options");
    const inlineExp = document.getElementById("inlineExplanation");
    const nextBtn = document.getElementById("nextBtn");
    const progressBar = document.getElementById("progressBar");

    if (currentQEl) currentQEl.textContent = currentQuestionIndex + 1;
    if (qTextEl) qTextEl.textContent = q.question;

    if (progressBar) {
        const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }

    // Reset inline explanation
    if (inlineExp) {
        inlineExp.style.display = "none";
        inlineExp.innerHTML = "";
    }

    if (optionsContainer) {
        optionsContainer.innerHTML = "";

        const hasAnswered = userAnswers[currentQuestionIndex] !== null;
        const correctIndex = typeof q.answer === "number" ? q.answer : (typeof q.correctAnswer === "number" ? q.correctAnswer : 0);

        q.options.forEach((option, idx) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.classList.add("option");
            btn.textContent = option;

            if (hasAnswered) {
                const userChoice = userAnswers[currentQuestionIndex];
                if (idx === correctIndex) {
                    btn.style.borderColor = "#16a34a";
                    btn.style.backgroundColor = "#dcfce7";
                    btn.style.color = "#14532d";
                    btn.innerHTML = `<i class="fa-solid fa-check" style="margin-right:8px; color:#16a34a;"></i> ${escapeHtml(option)}`;
                } else if (idx === userChoice) {
                    btn.style.borderColor = "#dc2626";
                    btn.style.backgroundColor = "#fee2e2";
                    btn.style.color = "#7f1d1d";
                    btn.innerHTML = `<i class="fa-solid fa-xmark" style="margin-right:8px; color:#dc2626;"></i> ${escapeHtml(option)}`;
                }
            } else {
                btn.addEventListener("click", () => selectAnswer(idx));
            }

            optionsContainer.appendChild(btn);
        });

        if (hasAnswered && q.explanation && inlineExp) {
            const isCorrect = userAnswers[currentQuestionIndex] === correctIndex;
            inlineExp.style.display = "block";
            inlineExp.style.background = isCorrect ? "#f0fdf4" : "#fef2f2";
            inlineExp.style.border = isCorrect ? "1px solid #86efac" : "1px solid #fecaca";
            inlineExp.style.color = isCorrect ? "#166534" : "#991b1b";
            inlineExp.innerHTML = `<strong>${isCorrect ? "✓ Correct!" : "✗ Incorrect."}</strong> ${escapeHtml(q.explanation)}`;
        }
    }

    if (nextBtn) {
        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.textContent = "Submit Assessment 🎯";
        } else {
            nextBtn.textContent = "Next Question →";
        }
    }
}

/* =========================================
   SELECT ANSWER
========================================= */
function selectAnswer(index) {
    userAnswers[currentQuestionIndex] = index;
    showQuestion();
}

/* =========================================
   NEXT BUTTON LISTENER
========================================= */
const nextBtn = document.getElementById("nextBtn");
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        if (userAnswers[currentQuestionIndex] === null) {
            alert("Please choose an answer option before moving forward.");
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        } else {
            // Update progress to 100%
            const progressBar = document.getElementById("progressBar");
            if (progressBar) progressBar.style.width = "100%";
            showResults();
        }
    });
}

/* =========================================
   SHOW RESULTS & ANALYSIS
========================================= */
function showResults() {
    if (quizSection) quizSection.style.display = "none";
    if (resultSection) resultSection.style.display = "block";

    let score = 0;
    questions.forEach((q, idx) => {
        const correctIndex = typeof q.answer === "number" ? q.answer : (typeof q.correctAnswer === "number" ? q.correctAnswer : 0);
        if (userAnswers[idx] === correctIndex) {
            score++;
        }
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    const scoreEl = document.getElementById("scoreText");
    if (scoreEl) scoreEl.textContent = `${score}/${total}`;

    const perfEl = document.getElementById("performanceText");
    const analysisEl = document.getElementById("analysisBox");

    let performance = "";
    let analysisHTML = "";

    if (percentage >= 80) {
        performance = `Mastery Achieved! 🎉 (${percentage}%)`;
        analysisHTML = `
            <div style="margin-bottom: 16px;">
                <h4 style="color:#166534; font-size:17px; margin-bottom:6px;"><i class="fa-solid fa-circle-check"></i> Strength Analysis</h4>
                <p>Outstanding command of <strong>${escapeHtml(selectedTopic)}</strong>. You accurately identified critical principles and demonstrated firm subject comprehension.</p>
            </div>
            <div>
                <h4 style="color:#4338ca; font-size:17px; margin-bottom:6px;"><i class="fa-solid fa-forward-step"></i> Recommended Next Step</h4>
                <p>Advance to higher-order challenges in <strong>${escapeHtml(selectedSubject)}</strong> or attempt the "Advanced" difficulty level to deepen your expertise.</p>
            </div>
        `;
    } else if (percentage >= 50) {
        performance = `Good Progress! Keep Going 🚀 (${percentage}%)`;
        analysisHTML = `
            <div style="margin-bottom: 16px;">
                <h4 style="color:#b45309; font-size:17px; margin-bottom:6px;"><i class="fa-solid fa-chart-line"></i> Learning Analysis</h4>
                <p>You have a solid foundation in <strong>${escapeHtml(selectedTopic)}</strong>, but there are a few nuanced conceptual areas that need fine-tuning.</p>
            </div>
            <div>
                <h4 style="color:#4338ca; font-size:17px; margin-bottom:6px;"><i class="fa-solid fa-book-open"></i> Recommended Next Step</h4>
                <p>Review the question explanations below, revisit foundational notes in your learning workspace, and take another quick assessment to solidify retention.</p>
            </div>
        `;
    } else {
        performance = `Competency Gap Detected 📚 (${percentage}%)`;
        analysisHTML = `
            <div style="margin-bottom: 16px;">
                <h4 style="color:#b91c1c; font-size:17px; margin-bottom:6px;"><i class="fa-solid fa-triangle-exclamation"></i> Identified Gap</h4>
                <p>Assessment indicates that foundational principles of <strong>${escapeHtml(selectedTopic)}</strong> require additional study and active problem practice.</p>
            </div>
            <div>
                <h4 style="color:#4338ca; font-size:17px; margin-bottom:6px;"><i class="fa-solid fa-lightbulb"></i> AI Recommendation</h4>
                <p>Upload lecture notes or summary PDFs into the SkillPilot Learning Workspace, examine core definitions, and retake this quiz in Beginner mode.</p>
            </div>
        `;
    }

    if (perfEl) perfEl.textContent = performance;
    if (analysisEl) analysisEl.innerHTML = analysisHTML;

    // Detailed Review List
    const reviewList = document.getElementById("reviewQuestionsList");
    if (reviewList) {
        reviewList.innerHTML = "";
        questions.forEach((q, idx) => {
            const correctIndex = typeof q.answer === "number" ? q.answer : (typeof q.correctAnswer === "number" ? q.correctAnswer : 0);
            const userPick = userAnswers[idx];
            const isCorrect = userPick === correctIndex;

            const item = document.createElement("div");
            item.style.padding = "18px";
            item.style.borderRadius = "12px";
            item.style.background = isCorrect ? "#f0fdf4" : "#fff1f2";
            item.style.border = isCorrect ? "1px solid #bbf7d0" : "1px solid #fecdd3";

            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <strong style="font-size:15px; color:#0f172a;">Q${idx + 1}. ${escapeHtml(q.question)}</strong>
                    <span style="font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; background:${isCorrect ? '#16a34a' : '#dc2626'}; color:white;">
                        ${isCorrect ? "Correct ✓" : "Incorrect ✗"}
                    </span>
                </div>
                <p style="font-size:14px; color:#334155; margin-bottom:4px;">
                    <strong>Your Answer:</strong> ${escapeHtml(q.options[userPick] || "Not answered")}
                </p>
                ${!isCorrect ? `<p style="font-size:14px; color:#15803d; margin-bottom:4px;"><strong>Correct Answer:</strong> ${escapeHtml(q.options[correctIndex])}</p>` : ''}
                <p style="font-size:13px; color:#64748b; margin-top:8px; border-top:1px dashed #cbd5e1; padding-top:6px;">
                    <strong>Explanation:</strong> ${escapeHtml(q.explanation || "No explanation provided.")}
                </p>
            `;

            reviewList.appendChild(item);
        });
    }
}

/* =========================================
   RESTART QUIZ
========================================= */
const restartBtn = document.getElementById("restartBtn");
if (restartBtn) {
    restartBtn.addEventListener("click", () => {
        localStorage.removeItem("generatedQuiz");
        questions = [];
        userAnswers = [];
        currentQuestionIndex = 0;

        if (resultSection) resultSection.style.display = "none";
        if (quizSection) quizSection.style.display = "none";
        if (loadingSection) loadingSection.style.display = "none";
        if (quizConfig) quizConfig.style.display = "block";

        const progressBar = document.getElementById("progressBar");
        if (progressBar) progressBar.style.width = "0%";
    });
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
     
