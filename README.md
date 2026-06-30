# 🚀 SkillForge – Developer Learning Tracker

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![GitHub API](https://img.shields.io/badge/API-GitHub-181717?logo=github&logoColor=white)](https://docs.github.com/en/rest)
[![Netlify](https://img.shields.io/badge/Frontend-Netlify-00C7B7?logo=netlify&logoColor=white)](https://adorable-granita-db1df3.netlify.app/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)](https://skillforge-api-cuw0.onrender.com)
![Status](https://img.shields.io/badge/Status-Production%20Live-brightgreen)
![Phase](https://img.shields.io/badge/Phase-2.3%20Design%20Tokens-blue)

---

## 📌 Overview

**SkillForge** is a full-stack developer learning tracker built to help software developers record study sessions, measure time invested, monitor consistency, and connect learning progress with real GitHub activity.

The application combines manual learning entries with GitHub profile and repository data. Entries are stored in MongoDB Atlas and loaded through a deployed Express API, providing real persistence across sessions and devices.

---

## 📊 Dashboard Preview

![SkillForge Dashboard](https://raw.githubusercontent.com/FHobbs8030/skillforge/main/frontend/src/assets/app.png)

---

## 🌐 Live Deployment

| Service | URL | Status |
| --- | --- | --- |
| Frontend application | [Open SkillForge](https://adorable-granita-db1df3.netlify.app/) | Live on Netlify |
| Backend API | [Open API](https://skillforge-api-cuw0.onrender.com) | Live on Render |
| API health check | [Check API health](https://skillforge-api-cuw0.onrender.com/health) | Returns `{"status":"OK"}` |
| Source repository | [FHobbs8030/skillforge](https://github.com/FHobbs8030/skillforge) | GitHub |

Production data flow:

```text
Netlify frontend
      ↓
Render Express API
      ├── MongoDB Atlas
      └── GitHub REST API
```

Netlify is connected to the repository and automatically deploys the `main` branch.

---

## ✨ Core Features

- Create learning entries with a topic, hours, date, and notes
- Save entries permanently in MongoDB Atlas
- Load saved entries from the deployed backend
- Delete entries with confirmation and a temporary loading state
- Calculate total entries and total learning hours
- Fetch a GitHub user profile and up to five repositories
- Display GitHub profile information in the application
- Navigate between Home and Profile routes
- Access the repository, LinkedIn, portfolio, and contact links from the footer
- Use the application across desktop, tablet, and mobile screen sizes
- View clear empty, loading, and error feedback states

---

## 🆕 Latest Upgrades

### Phase 2.3 — Centralized Design Tokens

The visual system is now controlled through shared CSS custom properties in `App.css`.

The centralized token system covers:

- colors and gradients
- spacing
- typography
- borders
- border radii
- shadows
- focus states
- transitions
- shared layout values

The following component styles were migrated to the shared system:

- `Header.css`
- `Footer.css`
- `EntryForm.css`
- `GitHubCard.css`
- `Stats.css`

This refactor preserves the current appearance while making future visual changes faster, safer, and more consistent.

### Deployment and Integration Improvements

- Linked the existing Netlify project to GitHub
- Configured automatic production deployments from `main`
- Added the production `VITE_API_URL` build variable
- Verified the Netlify frontend communicates with the Render backend
- Verified persistent entry data in MongoDB Atlas
- Verified GitHub API integration through the deployed backend
- Confirmed production API health and CORS behavior
- Added external repository, LinkedIn, portfolio, and contact links

### Responsive Validation

The current interface has been visually checked at desktop and responsive widths including:

- 700px
- 600px
- 520px
- 500px
- 480px
- 375px

---

## ▶️ How to Use SkillForge

1. Open the [live application](https://adorable-granita-db1df3.netlify.app/).
2. Enter a GitHub username, such as `octocat`.
3. Select **Fetch GitHub Data**.
4. Enter a learning topic, number of hours, date, and optional notes.
5. Select **Add Entry**.
6. Review the updated entry count and total hours.
7. Use **Delete** to remove an entry after confirming the action.
8. Refresh the page to confirm that saved data persists.

---

## 🏗️ Architecture

```text
Browser
  └── React 19 + Vite 8
        ├── React Router
        ├── Responsive component styles
        └── Centralized design tokens
              ↓ HTTPS
Render
  └── Node.js + Express 5 API
        ├── Entry validation
        ├── CORS controls
        ├── Error handling
        ├── MongoDB Atlas
        └── GitHub REST API
```

---

## 🧰 Tech Stack

### Frontend

- React 19
- Vite 8
- React Router
- JavaScript
- CSS custom properties
- Responsive CSS
- ESLint

### Backend

- Node.js
- Express 5
- Mongoose
- CORS
- dotenv
- node-fetch

### Database and APIs

- MongoDB Atlas
- GitHub REST API

### Deployment

- Netlify — frontend hosting and continuous deployment
- Render — backend API hosting
- GitHub — source control and deployment integration

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Confirms that the SkillForge API is running |
| `GET` | `/health` | Returns the API health status |
| `GET` | `/entries` | Retrieves all learning entries |
| `POST` | `/entries` | Creates a learning entry |
| `DELETE` | `/entries/:id` | Deletes a learning entry |
| `GET` | `/github/:username` | Retrieves GitHub profile and repository data |

---

## 📁 Project Structure

```text
skillforge/
├── backend/
│   ├── models/
│   │   └── Entry.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Clock/
│   │   │   ├── EntryForm/
│   │   │   ├── Footer/
│   │   │   ├── GitHubCard/
│   │   │   ├── Header/
│   │   │   └── Stats/
│   │   ├── pages/
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.css
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Local Installation

Clone the repository:

```bash
git clone https://github.com/FHobbs8030/skillforge.git
cd skillforge
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The local API runs on:

```text
http://localhost:3001
```

### Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local frontend URL in the terminal.

---

## 🌱 Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

Create `backend/.env`:

```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
GITHUB_TOKEN=your_github_token
```

Never commit `.env` files, MongoDB credentials, or GitHub tokens.

The deployed Netlify frontend uses:

```env
VITE_API_URL=https://skillforge-api-cuw0.onrender.com
```

---

## ✅ Validation

Frontend quality checks:

```bash
cd frontend
npm run lint
npm run build
```

The current production release has been verified for:

- successful ESLint validation
- successful Vite production build
- responsive layout behavior
- Netlify-to-Render API communication
- MongoDB Atlas persistence
- GitHub API responses
- entry creation and deletion
- production health endpoint availability

---

## 🗂️ Project Planning

![Trello Board](https://raw.githubusercontent.com/FHobbs8030/skillforge/stage-1-resubmit/frontend/src/assets/trello.png)

---

## 🛣️ Roadmap

Planned future improvements include:

- edit existing learning entries
- authentication and user-specific data
- skill categories and filtering
- learning streaks and progress charts
- repository activity summaries
- expanded profile analytics
- automated frontend and backend testing
- accessibility audits
- improved production logging
- custom domain support

---

## 📍 Project Status

### Phase 2.3 — Design Tokens: Complete

SkillForge is a real, deployed full-stack application. The frontend, backend, database, and GitHub API integration are connected and operational in production.

---

## 👨‍💻 Author

### Fred Hobbs

- GitHub: [FHobbs8030](https://github.com/FHobbs8030)
- LinkedIn: [Fred Hobbs](https://www.linkedin.com/in/fred-hobbs-70aa9417a/)
- Portfolio: [Responsive Portfolio](https://fhobbs8030.github.io/responsive-portfolio/)
- Contact: [Portfolio Contact Section](https://fhobbs8030.github.io/responsive-portfolio/#contact)
