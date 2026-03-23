# 🚀 SkillForge – Developer Learning Tracker

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Server-Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![GitHub API](https://img.shields.io/badge/API-GitHub-181717?logo=github)
![Status](https://img.shields.io/badge/Status-Stage%201%20In%20Progress-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📌 Overview

**SkillForge** is a full-stack web application designed to help developers track their learning progress, monitor consistency, and visualize growth over time.

The application combines **manual learning entries** with **real GitHub data** to provide a complete picture of developer activity and improvement.

---

## 📸 Project Preview

![SkillForge App](./images/app.png)

---

## 🌐 Live Project

<https://gleaming-meerkat-cfca2e.netlify.app/>

---

## 🗂️ Project Planning

![Trello Board](./images/trello.png)

---

## ✨ Features

### ✅ Current (Stage 1)

- Add learning entries (topic, hours, notes)
- Display entries in a clean dashboard UI
- Track total entries and total hours
- Responsive SaaS-style interface

### 🔄 Planned Features

#### 📚 Learning Tracker

- Edit and delete entries
- Store data in a database

#### 🐙 GitHub Integration

- Fetch user profile data
- Display repositories and activity
- Analyze languages used

#### 📊 Progress Analytics

- Track hours over time
- Visualize learning trends with charts

#### 🔐 Authentication

- User login/signup
- Secure data storage

---

## 🏗️ Architecture

```text
User (Browser)
   ↓
React Frontend (Vite)
   ↓
Node.js / Express Backend
   ↓
MongoDB Database
   ↓
GitHub API
```

---

## 🧰 Tech Stack

### Frontend

- React (Vite)
- CSS / Responsive Design

### Backend (Planned)

- Node.js
- Express.js

### Database (Planned)

- MongoDB

### External API

- GitHub REST API

---

## 🔌 API Integration

- GET /users/:username  
- GET /users/:username/repos  
- GET /users/:username/events  

---

## 📁 Project Structure

```text
skillforge/
├── frontend/
│   ├── src/
│   └── dist/
├── backend/
├── README.md
└── .gitignore
```

---

## ⚙️ Installation & Setup

### Clone the repository

```bash
git clone https://github.com/FHobbs8030/skillforge.git
cd skillforge
```

### Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### Setup Backend (when implemented)

```bash
cd backend
npm install
npm run dev
```

---

## 📈 Roadmap

### Stage 1

- React frontend initialized
- Entry tracking UI built
- Deployment completed

### Stage 2

- CRUD functionality for entries
- MongoDB integration

### Stage 3

- GitHub API integration
- Data visualization

### Stage 4

- Authentication (JWT)
- Full deployment

---

## 🎯 Goals

- Build a portfolio-quality full-stack application
- Demonstrate third-party API integration
- Showcase data-driven UI development
- Strengthen backend architecture skills

---

## 📌 Status

In Development – Stage 1

---

## 👨‍💻 Author

Fred Hobbs  
<https://github.com/FHobbs8030>

## Stage 1 Submission
