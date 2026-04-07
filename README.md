# 🚀 SkillForge – Developer Learning Tracker

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Server-Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![GitHub API](https://img.shields.io/badge/API-GitHub-181717?logo=github)
![Status](https://img.shields.io/badge/Status-Stage%201%20Complete-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📌 Overview

**SkillForge** is a full-stack web application designed to help developers track their learning progress, monitor consistency, and visualize growth over time.

The application combines **manual learning entries** with **real GitHub data** to provide a complete picture of developer activity.

---

## 📊 Dashboard Preview

![SkillForge Dashboard](https://raw.githubusercontent.com/FHobbs8030/skillforge/main/frontend/src/assets/app.png)

---

## 🌐 Live Project

https://adorable-granita-db1df3.netlify.app/

---

## 🗂️ Project Planning

![Trello Board](https://raw.githubusercontent.com/FHobbs8030/skillforge/main/frontend/src/assets/trello.png)

---

## ▶️ How to Use

1. Enter a GitHub username (e.g. `octocat`)
2. Click **Fetch GitHub Data**
3. Add learning entries (topic, hours, notes)
4. View total entries and total hours

---

## ✨ Features

- Add learning entries
- Track total entries and total hours
- Fetch GitHub user data
- Responsive UI

---

## 🏗️ Architecture

User → React (Vite) → Express API → MongoDB → GitHub API

---

## 🧰 Tech Stack

### Frontend
- React (Vite)
- CSS

### Backend
- Node.js
- Express

### Database
- MongoDB

### External API
- GitHub REST API

---

## 🔌 API Integration

- GET /github/:username
- GET /entries
- POST /entries

---

## ⚙️ Installation & Setup

```bash
git clone https://github.com/FHobbs8030/skillforge.git
cd skillforge
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

---

## 🌱 Environment Variables

Create a `.env` file in the frontend:

```
VITE_API_URL=http://localhost:3001
```

---

## 📌 Status

Stage 1 Complete – Ready for Review

---

## 👨‍💻 Author

Fred Hobbs  
https://github.com/FHobbs8030
