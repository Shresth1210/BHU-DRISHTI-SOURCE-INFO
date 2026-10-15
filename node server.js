import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

app.use(cors());
app.use(express.json());

/* Serve static frontend files */
app.use(express.static("."));

/* Route for landing page */
app.get("/", (req, res) => {
    res.sendFile(path.resolve("index.html"));
});

/* Check Gemini API Key */
const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");

let ai = null;
if (hasApiKey) {
    try {
        ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY.trim()
        });
        console.log("✓ Google Gemini API initialized successfully.");
    } catch (err) {
        console.warn("⚠️ Warning initializing Google Gemini API:", err.message);
    }
} else {
    console.log("ℹ️ Note: GEMINI_API_KEY is not set in .env.");
    console.log("   The server will run in smart Demo Mode with instant topic-aware quizzes.");
    console.log("   To enable live Gemini AI generation, paste your key into .env and restart.");
}

/* =======================================================
   FALLBACK / DEMO QUIZ GENERATOR
   Ensures the demo always works smoothly without crashing!
======================================================= */
function generateFallbackQuiz(subject, topic, difficulty, count = 5) {
    const questionsCount = Math.max(1, Math.min(Number(count) || 5, 20));
    const normalizedTopic = topic || "General Concepts";
    const normalizedSubject = subject || "Computer Science";

    const bank = [
        {
            question: `In the context of ${normalizedSubject}, what is the primary fundamental objective of studying "${normalizedTopic}"?`,
            options: [
                `To understand core architectural principles and problem-solving mechanisms in ${normalizedTopic}`,
                `To completely eliminate the need for memory management and computational logic`,
                `To replace software algorithms with physical hardware circuits`,
                `To bypass standard protocols and system security guidelines`
            ],
            answer: 0,
            explanation: `Understanding the core principles and logic of ${normalizedTopic} allows developers and engineers to design scalable, efficient solutions in ${normalizedSubject}.`
        },
        {
            question: `Which of the following best describes an optimal practice when implementing concepts in "${normalizedTopic}"?`,
            options: [
                `Ignoring boundary conditions and edge cases during early development`,
                `Structuring modular logic, verifying edge cases, and analyzing complexity`,
                `Hardcoding constant parameters directly inside critical routines`,
                `Avoiding documentation and peer code verification`
            ],
            answer: 1,
            explanation: `Modular structure, thorough edge case handling, and complexity evaluation are hallmark best practices when working with ${normalizedTopic}.`
        },
        {
            question: `When evaluating efficiency in ${normalizedTopic} (${difficulty} level), which factor typically has the most critical impact?`,
            options: [
                `The visual theme and font color of the code editor`,
                `Time complexity (execution time) and space complexity (memory usage)`,
                `The physical length of function names in the source code`,
                `The time of day the program is compiled`
            ],
            answer: 1,
            explanation: `Algorithm efficiency is fundamentally measured by asymptotic time and space complexity as input size scales.`
        },
        {
            question: `What common challenge often arises when scaling or optimizing "${normalizedTopic}" in real-world scenarios?`,
            options: [
                `Balancing performance trade-offs between memory consumption and processing speed`,
                `Compilers refusing to process more than 100 lines of code`,
                `Hardware processors overheating due to variable naming conventions`,
                `Operating systems rejecting mathematical calculations`
            ],
            answer: 0,
            explanation: `A central engineering trade-off in ${normalizedTopic} involves balancing space vs. time efficiency based on system constraints.`
        },
        {
            question: `Which approach is most recommended to test and validate your understanding of "${normalizedTopic}"?`,
            options: [
                `Never running unit tests or assessing edge cases`,
                `Applying concepts to hands-on problem sets, building sample projects, and assessing results`,
                `Memorizing syntax without understanding underlying control flow`,
                `Relying solely on guesswork without measuring output accuracy`
            ],
            answer: 1,
            explanation: `Active problem solving, continuous self-assessment, and building practical projects reinforce lasting mastery of ${normalizedTopic}.`
        },
        {
            question: `How does "${normalizedTopic}" integrate with broader workflows in ${normalizedSubject}?`,
            options: [
                `It operates completely isolated without connecting to any other system component`,
                `It provides reusable patterns and structured data pipelines for higher-level applications`,
                `It prevents other modules from executing correctly`,
                `It requires manual user intervention for every single low-level instruction`
            ],
            answer: 1,
            explanation: `${normalizedTopic} forms foundational components that integrate with system pipelines and high-level applications in ${normalizedSubject}.`
        }
    ];

    // Select the requested number of questions
    const selected = [];
    for (let i = 0; i < questionsCount; i++) {
        const template = bank[i % bank.length];
        selected.push({
            id: i + 1,
            question: i >= bank.length ? `[${difficulty}] Advanced Concept: Question #${i + 1} regarding ${normalizedTopic}` : template.question,
            options: [...template.options],
            answer: template.answer,
            correctAnswer: template.answer,
            explanation: template.explanation
        });
    }

    return selected;
}

/* =======================================================
   AI QUIZ GENERATION HANDLER
======================================================= */
async function handleGenerateQuiz(req, res) {
    const { subject, topic, difficulty, numberOfQuestions } = req.body;

    console.log("\n-------------------------------------------");
    console.log("Quiz Generation Request Received:");
    console.log(`Domain: ${subject || "(unspecified)"} | Topic: ${topic || "(unspecified)"} | Difficulty: ${difficulty || "Beginner"} | Questions: ${numberOfQuestions || 5}`);

    if (!subject || subject.trim() === "") {
        return res.status(400).json({
            success: false,
            error: "Please select a domain/subject"
        });
    }

    if (!topic || topic.trim() === "") {
        return res.status(400).json({
            success: false,
            error: "Please enter a topic"
        });
    }

    const count = Math.max(1, Math.min(Number(numberOfQuestions) || 5, 20));
    const targetDifficulty = difficulty || "Beginner";

    // If no API key or AI client is configured, use the smart fallback generator
    if (!ai || !hasApiKey) {
        console.log("→ Serving quiz via intelligent Demo Generator (Set GEMINI_API_KEY in .env for live Gemini output)");
        const fallbackQuiz = generateFallbackQuiz(subject, topic, targetDifficulty, count);
        return res.json({
            success: true,
            source: "demo",
            quiz: fallbackQuiz,
            questions: fallbackQuiz,
            total: fallbackQuiz.length
        });
    }

    // Call Google Gemini API
    try {
        const prompt = `
You are an intelligent educational assessment creator.
Generate a multiple-choice quiz for students on the following topic.

DOMAIN / SUBJECT: ${subject}
SPECIFIC TOPIC: ${topic}
DIFFICULTY LEVEL: ${targetDifficulty}
NUMBER OF QUESTIONS: ${count}

REQUIREMENTS:
1. Every question must be directly focused on "${topic}" in ${subject}.
2. Ensure the difficulty reflects "${targetDifficulty}".
3. Generate exactly ${count} multiple-choice questions.
4. Each question must have exactly 4 options.
5. "answer" must be the 0-based integer index (0, 1, 2, or 3) of the correct option.
6. Provide a concise, educational explanation for why that answer is correct.

Output ONLY a JSON array with this exact format, with no surrounding text or markdown formatting:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Clear educational explanation."
  }
]
`;

        console.log(`→ Calling Google Gemini API (${GEMINI_MODEL}) for topic: "${topic}"...`);

        let responseText = "";

        try {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.7
                }
            });
            responseText = response.text;
        } catch (apiErr) {
            console.warn(`Primary model ${GEMINI_MODEL} failed (${apiErr.message}). Retrying with gemini-3.7-flash...`);
            const retryResponse = await ai.models.generateContent({
                model: "gemini-3.7-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.7
                }
            });
            responseText = retryResponse.text;
        }

        if (!responseText || responseText.trim() === "") {
            throw new Error("Gemini returned empty text response");
        }

        // Clean any accidental markdown wrappers (```json ... ```)
        let cleanedJson = responseText.trim();
        if (cleanedJson.startsWith("```json")) {
            cleanedJson = cleanedJson.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
        } else if (cleanedJson.startsWith("```")) {
            cleanedJson = cleanedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        const parsedQuiz = JSON.parse(cleanedJson);

        if (!Array.isArray(parsedQuiz) || parsedQuiz.length === 0) {
            throw new Error("Parsed quiz is not a non-empty array");
        }

        // Normalize format so both answer and correctAnswer exist
        const formattedQuiz = parsedQuiz.map((q, index) => {
            const ansIndex = typeof q.answer === "number" ? q.answer : (typeof q.correctAnswer === "number" ? q.correctAnswer : 0);
            return {
                id: index + 1,
                question: q.question || `Question ${index + 1}`,
                options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["Option 1", "Option 2", "Option 3", "Option 4"],
                answer: ansIndex,
                correctAnswer: ansIndex,
                explanation: q.explanation || "Correct answer identified by Gemini AI."
            };
        });

        console.log(`✓ Successfully generated ${formattedQuiz.length} questions with Google Gemini!`);

        return res.json({
            success: true,
            source: "gemini",
            model: GEMINI_MODEL,
            quiz: formattedQuiz,
            questions: formattedQuiz,
            total: formattedQuiz.length
        });

    } catch (error) {
        console.error("Gemini API Error:", error.message);
        console.log("→ Falling back to smart demo quiz generator so demo stays functional.");

        const fallbackQuiz = generateFallbackQuiz(subject, topic, targetDifficulty, count);
        return res.json({
            success: true,
            source: "fallback",
            note: "Generated using demo generator due to Gemini API error: " + error.message,
            quiz: fallbackQuiz,
            questions: fallbackQuiz,
            total: fallbackQuiz.length
        });
    }
}

/* Endpoint aliases */
app.post("/api/generate-quiz", handleGenerateQuiz);
app.post("/generate-quiz", handleGenerateQuiz);

/* =======================================================
   START SERVER
======================================================= */
app.listen(PORT, () => {
    console.log("");
    console.log("==========================================");
    console.log("     SKILLPILOT AI - LEARNING SERVER      ");
    console.log("==========================================");
    console.log(`✓ Server running at: http://localhost:${PORT}`);
    console.log(`✓ Workspace:         http://localhost:${PORT}/learning.html`);
    console.log(`✓ Quiz Page:         http://localhost:${PORT}/quiz.html`);
    console.log("==========================================\n");
});
