/* =========================================
   SKILLPILOT AI - LEARNING WORKSPACE SCRIPT
========================================= */

const generateBtn = document.getElementById("generateBtn");
const subjectInput = document.getElementById("subject");
const topicInput = document.getElementById("topic");

// Dynamic state
let selectedDifficulty = "Beginner";
let selectedQuestions = 5;
let uploadedFiles = [];

/* =========================================
   DIFFICULTY SELECTION
========================================= */
const difficultyButtons = document.querySelectorAll(".difficulty-options .difficulty");
difficultyButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        difficultyButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedDifficulty = btn.getAttribute("data-level") || btn.textContent.trim();
        console.log("Selected difficulty:", selectedDifficulty);
    });
});

// Also support <select id="difficulty"> if present
const difficultySelect = document.getElementById("difficulty");
if (difficultySelect && difficultySelect.tagName === "SELECT") {
    difficultySelect.addEventListener("change", () => {
        selectedDifficulty = difficultySelect.value;
    });
}

/* =========================================
   QUESTION COUNT SELECTION
========================================= */
const questionButtons = document.querySelectorAll(".question-options .question-btn");
questionButtons.forEach(btn => {
    // If one is initially active, read it
    if (btn.classList.contains("active")) {
        selectedQuestions = Number(btn.getAttribute("data-questions") || btn.textContent.trim()) || 5;
    }

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        questionButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedQuestions = Number(btn.getAttribute("data-questions") || btn.textContent.trim()) || 5;
        console.log("Selected questions:", selectedQuestions);
    });
});

/* =========================================
   FILE UPLOAD & DRAG AND DROP
========================================= */
const fileInput = document.getElementById("fileInput");
const browseButton = document.getElementById("browseButton");
const dropZone = document.getElementById("dropZone");
const fileList = document.getElementById("fileList");
const fileCount = document.getElementById("fileCount");

if (browseButton && fileInput) {
    browseButton.addEventListener("click", (e) => {
        e.preventDefault();
        fileInput.click();
    });
}

if (fileInput) {
    fileInput.addEventListener("change", () => {
        if (fileInput.files) {
            handleNewFiles(Array.from(fileInput.files));
        }
    });
}

if (dropZone) {
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "#4f46e5";
        dropZone.style.background = "#eef2ff";
    });

    dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "";
        dropZone.style.background = "";
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "";
        dropZone.style.background = "";
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleNewFiles(Array.from(e.dataTransfer.files));
        }
    });
}

function handleNewFiles(files) {
    files.forEach(f => {
        if (!uploadedFiles.some(existing => existing.name === f.name && existing.size === f.size)) {
            uploadedFiles.push(f);
        }
    });
    renderFileList();
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
}

function renderFileList() {
    if (!fileList || !fileCount) return;

    fileCount.textContent = `${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'}`;

    if (uploadedFiles.length === 0) {
        fileList.innerHTML = `
            <div class="empty-files">
                <i class="fa-regular fa-folder-open"></i>
                <p>Your uploaded materials will appear here.</p>
            </div>
        `;
        return;
    }

    fileList.innerHTML = "";
    uploadedFiles.forEach((file, index) => {
        const item = document.createElement("div");
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.alignItems = "center";
        item.style.padding = "10px 14px";
        item.style.marginBottom = "8px";
        item.style.background = "white";
        item.style.borderRadius = "8px";
        item.style.border = "1px solid #e2e8f0";

        const sizeKb = (file.size / 1024).toFixed(1);
        const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${sizeKb} KB`;

        item.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
                <i class="fa-solid fa-file-lines" style="color:#4f46e5;"></i>
                <span style="font-size:14px; font-weight:500; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; max-width:240px;">${escapeHtml(file.name)}</span>
                <span style="font-size:12px; color:#94a3b8;">(${sizeStr})</span>
            </div>
            <button type="button" style="border:none; background:transparent; color:#ef4444; cursor:pointer; font-size:14px; padding:4px;" title="Remove file">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;

        item.querySelector("button").addEventListener("click", () => removeFile(index));
        fileList.appendChild(item);
    });
}

/* =========================================
   GENERATE AI QUIZ
========================================= */
if (generateBtn) {
    generateBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        const subject = subjectInput ? subjectInput.value.trim() : "";
        const topic = topicInput ? topicInput.value.trim() : "";

        if (!subject) {
            alert("Please select a domain / subject!");
            if (subjectInput) subjectInput.focus();
            return;
        }

        if (!topic) {
            alert("Please enter a topic (e.g. Data Structures, Photosynthesis, Thermodynamics)!");
            if (topicInput) topicInput.focus();
            return;
        }

        const originalButtonHTML = generateBtn.innerHTML;

        // Button Loading State
        generateBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin" style="margin-right:8px;"></i>
            <span>Generating with Gemini AI...</span>
        `;
        generateBtn.disabled = true;

        try {
            const response = await fetch("/api/generate-quiz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    subject,
                    topic,
                    difficulty: selectedDifficulty,
                    numberOfQuestions: selectedQuestions
                })
            });

            const data = await response.json();
            console.log("Quiz Response:", data);

            if (!response.ok) {
                throw new Error(data.error || data.details || "Failed to generate quiz from server.");
            }

            const generatedQuiz = data.quiz || data.questions;

            if (!generatedQuiz || !Array.isArray(generatedQuiz) || generatedQuiz.length === 0) {
                throw new Error("AI did not return any quiz questions.");
            }

            // Save settings & quiz to localStorage
            const quizSettings = {
                subject,
                topic,
                difficulty: selectedDifficulty,
                questions: generatedQuiz.length,
                fileCount: uploadedFiles.length
            };

            localStorage.setItem("skillPilotQuiz", JSON.stringify(quizSettings));
            localStorage.setItem("generatedQuiz", JSON.stringify(generatedQuiz));

            // Redirect smoothly to quiz.html
            window.location.href = "quiz.html";

        } catch (error) {
            console.error("Quiz Generation Error:", error);
            alert("Quiz generation issue:\n\n" + error.message);

            generateBtn.innerHTML = originalButtonHTML;
            generateBtn.disabled = false;
        }
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
