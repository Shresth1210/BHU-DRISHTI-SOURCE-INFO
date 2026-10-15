# ✦ SkillPilot AI — AI-Powered Personalized Learning & Quiz Platform

> **A beginner-friendly, end-to-end full-stack web project built with Node.js, Express, Vanilla JavaScript, and Google Gemini AI.**  
> Perfect for college project presentations, hackathons, and learning full-stack web development!  
> 
> 💡 **New to this project or preparing for an evaluation?** Check out the in-depth **[PROJECT_EXPLAINED.md](PROJECT_EXPLAINED.md)** guide with line-by-line explanations and interview questions!

---

## 📖 1. What is SkillPilot AI?

**SkillPilot AI** is an intelligent educational assistant that helps students master any academic topic. 

Instead of taking generic multiple-choice tests, students can:
1. **Choose any subject and topic** (e.g., Computer Science → *Binary Search Trees*, Physics → *Newton's Laws*, Chemistry → *Thermodynamics*).
2. **Select their skill level** (Beginner, Intermediate, Advanced) and question count.
3. **Upload notes or study materials** (.pdf, .txt, .docx).
4. **Generate dynamic assessments with Google Gemini AI** tailored specifically to that topic.
5. **Receive instant feedback with explanations** for each question and a **comprehensive AI competency breakdown** highlighting strengths and areas to improve.

---

## 🏗️ 2. How the Project Works (Architecture)

Here is how the data flows between the user's browser, the local server, and Google's Gemini AI:

```
+--------------------+        HTTP POST /api/generate-quiz        +--------------------+
|                    | -----------------------------------------> |                    |
|  User's Browser    |      { subject, topic, difficulty, count } |  Node.js Express   |
| (learning.html /   |                                            |     Backend        |
|     quiz.html)     | <----------------------------------------- |   (server.js)      |
|                    |     JSON: { success: true, quiz: [...] }   |                    |
+--------------------+                                            +--------------------+
         |                                                                   |
         | (Saves questions to localStorage)                                 | (Calls Gemini SDK)
         v                                                                   v
+--------------------+                                            +--------------------+
|  Interactive Quiz  |                                            |    Google Gemini   |
|  & Instant Score   |                                            |      2.0 Flash     |
|   with AI Analysis |                                            |       Cloud        |
+--------------------+                                            +--------------------+
```

1. **Frontend (Browser UI)**:
   - The user fills out the form on `learning.html` or `quiz.html`.
   - JavaScript sends a `POST` request with the chosen topic to the Node.js server.
2. **Backend Server (`server.js`)**:
   - Built with Express.js running on `http://localhost:3000`.
   - Takes the user's subject, topic, and difficulty, and constructs a structured prompt.
   - Calls Google Gemini using the official `@google/genai` library.
   - Cleans and parses Gemini's response into valid JSON.
   - **Smart Fallback / Demo Mode**: If no Gemini API key is provided, or if the API limit is reached, the server automatically generates smart, topic-aware demo questions so **your demo will never crash during a presentation**!
3. **Frontend Results (`quiz.js`)**:
   - Renders interactive multiple-choice cards.
   - Shows immediate color-coded feedback (green for correct, red for incorrect) and educational explanations.
   - Scores the assessment and generates a personalized Competency Gap Analysis.

---

## 📂 3. Project Structure & Files Explained

| File / Folder | What It Does |
| :--- | :--- |
| `server.js` | The backend Node.js server. Handles static file hosting and Google Gemini API requests. |
| `index.html` | The landing homepage introducing the platform, features, and workflow. |
| `learning.html` | The student workspace where you select subjects, enter topics, and upload notes. |
| `learning.js` | Client-side logic for `learning.html`: handles button toggles, file uploads, and calls the quiz API. |
| `learning.css` | Stylesheet for the learning workspace page. |
| `quiz.html` | The assessment page where questions, options, timer/progress, and results are displayed. |
| `quiz.js` | Client-side logic for `quiz.html`: displays questions, tracks user answers, scores results, and renders AI feedback. |
| `quiz.css` | Stylesheet for the quiz cards, options, score circle, and review cards. |
| `style1.css` | Modern styling for the main landing page (`index.html`). |
| `.env` | Environment file containing your private `GEMINI_API_KEY` and port settings. |
| `.env.example` | Template showing how to configure `.env`. |
| `package.json` | Lists project metadata, scripts (`npm start`), and npm package dependencies. |
| `.gitignore` | Prevents uploading `node_modules/` or secret `.env` keys to GitHub. |

---

## 🚀 4. Quick Start Guide (For First-Year Students)

### Step 1: Install Node.js
If you don't have Node.js installed on your computer:
1. Download the LTS version from [nodejs.org](https://nodejs.org/).
2. Run the installer (keep default options).
3. Verify by opening a terminal (Command Prompt or PowerShell) and typing:
   ```bash
   node -v
   npm -v
   ```

### Step 2: Install Project Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```
*This installs Express, CORS, Dotenv, and the Google Gen AI SDK.*

### Step 3: (Optional) Add your Google Gemini API Key
SkillPilot AI works **with or without** an API key!
- **With API Key**: Real-time AI generation from Google Gemini.
- **Without API Key**: The built-in intelligent demo generator provides realistic questions so you can test everything right away.

To use Google Gemini:
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Open the `.env` file in the project folder.
3. Paste your key:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key_here...
   PORT=3000
   GEMINI_MODEL=gemini-2.0-flash
   ```
4. Save the file.

### Step 4: Start the Server
Run:
```bash
npm start
```
You will see:
```text
==========================================
     SKILLPILOT AI - LEARNING SERVER      
==========================================
✓ Server running at: http://localhost:3000
✓ Workspace:         http://localhost:3000/learning.html
✓ Quiz Page:         http://localhost:3000/quiz.html
==========================================
```

### Step 5: Open in Your Browser
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🎯 5. How to Demonstrate the Project in 3 Minutes

Follow these steps during your hackathon or class demonstration:

1. **Homepage (`index.html`)**:
   - Show the modern landing page.
   - Click the **"Start Learning"** button.
2. **Learning Workspace (`learning.html`)**:
   - Choose a domain: e.g., **Computer Science**.
   - Type a topic: e.g., **Binary Search Trees** (or *Object Oriented Programming*, *Photosynthesis*).
   - Select difficulty: **Beginner**, **Intermediate**, or **Advanced**.
   - Select question count: **5 questions**.
   - Optional: Click **"Browse Files"** or drag a file into the drop zone to show study material integration.
   - Click **"Generate AI Quiz"**.
3. **Interactive Quiz (`quiz.html`)**:
   - Notice how the generated quiz loads automatically with a progress bar.
   - Click an option: notice the instant color-coded feedback and the educational explanation provided for each question!
   - Step through the questions using **"Next Question →"**.
4. **Results & Competency Analysis**:
   - Complete the quiz to see the score circle (e.g., `4/5`).
   - Show the **AI Strength Analysis**, **Competency Gap Detected**, and **Recommended Next Steps**.
   - Scroll down to review each question, the student's answer, the correct answer, and the detailed explanation.
   - Click **"Take Another Quiz"** to customize and generate another quiz on the fly.

---

## 💡 6. Common Troubleshooting for Beginners

### Q: "Cannot find module express or @google/genai"
**Solution**: You forgot to install packages. Run `npm install` in the project folder.

### Q: "Port 3000 is already in use"
**Solution**: Another program is using port 3000. Either close that program, or change `PORT=3001` in your `.env` file and visit `http://localhost:3001`.

### Q: "Where do I get a free Gemini API key?"
**Solution**: Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey), sign in with any Google account, and click **Create API Key**. It is completely free.

### Q: "Does the demo work if I don't have internet or an API key?"
**Solution**: **Yes!** The server has a built-in topic-aware demo generator. If the key is missing or the network drops, it immediately provides realistic quiz questions for the chosen topic so your demo runs flawlessly.

---

## 🛠️ 7. Technologies Used

- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism & Modern UI), JavaScript (ES6+), Font Awesome Icons.
- **Backend**: Node.js, Express.js v5.
- **Artificial Intelligence**: Google Gemini API via official `@google/genai` SDK (`gemini-2.0-flash`).
- **Data Persistence**: Browser `localStorage` for seamless state transfer between pages.

---

## 👨‍💻 Contributing & Learning
This project was designed specifically to be simple, clean, and hackable. Explore `server.js`, `learning.js`, and `quiz.js` to see how easy it is to integrate AI into your own web applications!
