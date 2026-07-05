# 🚀 SkillForge – Developer Learning & Collaboration Workspace

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React Router 7](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![GitHub API](https://img.shields.io/badge/API-GitHub-181717?logo=github&logoColor=white)](https://docs.github.com/en/rest)
[![Netlify](https://img.shields.io/badge/Frontend-Netlify-00C7B7?logo=netlify&logoColor=white)](https://adorable-granita-db1df3.netlify.app/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)](https://skillforge-api-cuw0.onrender.com)
![Status](https://img.shields.io/badge/Status-Production%20Live-brightgreen)
![Phase](https://img.shields.io/badge/Phase-Authenticated%20Workspace-blue)

---

## 📌 Overview

**SkillForge** is a full-stack developer learning and collaboration workspace designed for individual developers, project hosts, and distributed collaborators.

The project began as a developer learning tracker and has evolved into a broader product experience with:

- a public welcome and product-introduction flow
- an interactive demo mission
- host and collaborator workspace previews
- secure account registration and sign-in
- persistent authenticated sessions
- a protected member dashboard
- a protected account profile
- GitHub API integration
- responsive layouts for desktop, tablet, and mobile

The current milestone establishes the foundation for user-owned projects, learning activity, team work sections, progress tracking, and profile management.

---

## 📊 Application Preview

![SkillForge Dashboard](https://raw.githubusercontent.com/FHobbs8030/skillforge/main/frontend/src/assets/app.png)

> Replace `frontend/src/assets/app.png` with an updated screenshot to refresh this preview without changing the README image path.

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
      ↓ HTTPS
Render Express API
      ├── MongoDB Atlas
      └── GitHub REST API
```

Netlify deploys the frontend from the `main` branch. Render hosts the Express API and connects it to MongoDB Atlas and the GitHub REST API.

---

## ✨ Current Features

### Public Product Experience

- Responsive welcome page with product messaging and navigation
- Interactive demo mission for exploring the SkillForge concept
- Host workspace preview
- Collaborator workspace preview
- Responsive header and footer
- Active navigation states
- External GitHub, LinkedIn, portfolio, and contact links

### Host Workspace Preview

- Project overview widget
- Work-section creation interface
- Create-work-section modal
- Section summary widget
- Distributed team local-time widget
- Responsive host dashboard layout
- Mock project data for product validation

### Collaborator Workspace Preview

- Collaborator-focused project overview
- Work-section visibility
- Team communication interface
- Responsive collaborator dashboard layout
- Mock collaborator data for product validation

### Authentication

- Account registration with full-name, email, password, and membership validation
- Free, Pro, and Team membership options
- Duplicate-email protection
- Password hashing with `bcryptjs`
- JWT-based sign-in
- Protected current-user endpoint
- Persistent browser session restoration
- Sign-out support
- Public-only sign-in and sign-up routes
- Protected `/app` and `/profile` routes
- Redirect-to-sign-in behavior for unauthenticated users

### Authenticated Dashboard

- Dedicated member workspace at `/app`
- Overview section
- Workspace section
- Activity section
- Account section
- Header section navigation
- Authenticated user identity display
- Responsive dashboard cards and status panels
- Mobile navigation support

### Authenticated Profile

- Dedicated protected profile at `/profile`
- Member identity card
- Full name and email display
- Membership information
- Account creation date
- Account security summary
- Development connection status
- Planned profile and account controls
- Responsive single-column mobile layout
- Verified behavior down to 320px
- Automatic scroll reset during route navigation

### Backend and Integration

- Express 5 API
- MongoDB Atlas connection
- Mongoose user model
- Unique normalized email addresses
- JWT authentication middleware
- Controlled CORS configuration
- Environment-based token expiration
- GitHub profile and repository lookup
- API health endpoint
- Structured validation and error responses

---

## 🆕 Authenticated Workspace Milestone

The current `main` branch includes the complete authenticated-workspace foundation.

| Milestone | Status |
| --- | --- |
| Welcome experience | Complete |
| Demo mission | Complete |
| Host workspace preview | Complete |
| Collaborator workspace preview | Complete |
| Authentication session foundation | Complete |
| Protected route foundation | Complete |
| Authenticated dashboard foundation | Complete |
| Dashboard section navigation | Complete |
| Authenticated profile foundation | Complete |
| Responsive validation through 320px | Complete |
| Profile editing | Planned next |

### Recent Engineering Improvements

- Replaced the original single-page tracker interface with a routed product experience
- Added authentication context and centralized session state
- Added protected and public-only route guards
- Added JWT restoration through `/auth/me`
- Added dedicated sign-up and sign-in interfaces
- Added responsive authenticated navigation
- Added a dedicated member dashboard
- Added route-aware section navigation
- Added a protected profile experience
- Consolidated and reorganized responsive header styles
- Added route-change scroll restoration
- Removed obsolete entry-tracker components and the original entry model
- Added collaboration planning documentation
- Validated successful Vite production builds after each milestone

---

## ▶️ How to Explore SkillForge

### Public Experience

1. Open the [live application](https://adorable-granita-db1df3.netlify.app/).
2. Review the welcome page and product overview.
3. Open the demo mission.
4. Explore the Host Demo workspace.
5. Explore the Collaborator Demo workspace.

### Create an Account

1. Select **Sign Up**.
2. Enter a full name and valid email address.
3. Create a password with at least eight characters.
4. Select a Free, Pro, or Team membership.
5. Submit the registration form.
6. Sign in with the new account credentials.

### Authenticated Experience

1. Sign in to restore the authenticated SkillForge session.
2. Explore the member dashboard at `/app`.
3. Use the dashboard section links to navigate between Overview, Workspace, Activity, and Account.
4. Open the protected profile at `/profile`.
5. Review account, membership, security, and development-connection information.
6. Sign out when finished.

---

## 🏗️ Architecture

```text
Browser
└── React 19 + Vite 8
    ├── React Router
    ├── AuthProvider / AuthContext
    ├── Public-only route guards
    ├── Protected route guards
    ├── Welcome and demo experiences
    ├── Host and collaborator previews
    ├── Authenticated dashboard
    ├── Authenticated profile
    └── Responsive CSS system
            ↓ HTTPS / JSON
Render
└── Node.js + Express 5
    ├── Request validation
    ├── CORS controls
    ├── Authentication routes
    ├── JWT middleware
    ├── Password hashing
    ├── Error handling
    ├── MongoDB Atlas
    └── GitHub REST API
```

### Authentication Flow

```text
Sign Up
  ↓
Validate account fields
  ↓
Hash password with bcrypt
  ↓
Store user in MongoDB Atlas

Sign In
  ↓
Validate credentials
  ↓
Compare password hash
  ↓
Issue signed JWT
  ↓
Store authenticated session
  ↓
Restore current user through GET /auth/me
  ↓
Allow access to /app and /profile
```

---

## 🧰 Tech Stack

### Frontend

- React 19
- React DOM 19
- Vite 8
- React Router 7
- JavaScript
- CSS custom properties
- Responsive CSS
- ESLint

### Backend

- Node.js
- Express 5
- Mongoose
- `bcryptjs`
- `jsonwebtoken`
- CORS
- `dotenv`
- `node-fetch`

### Database and APIs

- MongoDB Atlas
- GitHub REST API

### Deployment

- Netlify — frontend hosting and continuous deployment
- Render — backend API hosting
- GitHub — source control and deployment integration

---

## 🔌 API Endpoints

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Confirms that the SkillForge API is running |
| `GET` | `/health` | Public | Returns the API health status |
| `POST` | `/auth/signup` | Public | Creates a SkillForge user account |
| `POST` | `/auth/signin` | Public | Validates credentials and returns a JWT |
| `GET` | `/auth/me` | Bearer token | Returns the authenticated user |
| `GET` | `/github/:username` | Public | Retrieves a GitHub profile and up to five repositories |

### Authorization Header

Protected API requests use:

```http
Authorization: Bearer <jwt-token>
```

---

## 🔐 Security Foundation

- Passwords are never stored in plain text
- Passwords are hashed with bcrypt
- Duplicate email addresses are rejected
- Email addresses are normalized before storage
- JWTs use the `HS256` algorithm
- JWT expiration is controlled through environment configuration
- Protected requests are validated by authentication middleware
- Password hashes are excluded from normal user responses
- Production CORS access is restricted to the deployed frontend
- Localhost origins are permitted during development
- Secrets are stored in environment variables
- `.env` files and credentials must never be committed

---

## 📁 Project Structure

```text
skillforge/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── docs/
│   │   └── SKILLFORGE_COLLABORATION_PLAN.md
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Clock/
│   │   │   ├── Footer/
│   │   │   ├── Header/
│   │   │   └── host/
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   ├── AuthProvider.jsx
│   │   │   └── useAuth.js
│   │   ├── data/
│   │   │   ├── mockCollaboratorData.js
│   │   │   └── mockHostData.js
│   │   ├── pages/
│   │   │   ├── AppDashboard/
│   │   │   ├── AuthPage/
│   │   │   ├── CollaboratorDashboard/
│   │   │   ├── DemoMission/
│   │   │   ├── HostDashboard/
│   │   │   ├── ProfilePage/
│   │   │   └── WelcomePage/
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
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

Vite will display and open the local frontend URL.

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
JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=1h
```

The deployed Netlify frontend uses:

```env
VITE_API_URL=https://skillforge-api-cuw0.onrender.com
```

Never commit `.env` files, MongoDB credentials, GitHub tokens, JWT secrets, or user passwords.

---

## ✅ Validation

Frontend quality checks:

```bash
cd frontend
npm run lint
npm run build
git diff --check
```

Backend startup check:

```bash
cd backend
npm run dev
```

The authenticated-workspace milestone has been verified for:

- successful Vite production builds
- clean whitespace validation
- public route access
- protected route redirects
- account registration
- account sign-in
- persistent session restoration
- current-user authentication
- authenticated dashboard access
- authenticated profile access
- sign-out behavior
- route navigation and active states
- route-change scroll restoration
- responsive desktop, tablet, and mobile layouts
- 320px profile and authenticated-header behavior
- Netlify-to-Render API communication
- MongoDB Atlas connectivity
- GitHub API responses
- API health endpoint availability

---

## 🖼️ Screenshots and Project Planning

### Application Screenshot

![SkillForge Dashboard](https://raw.githubusercontent.com/FHobbs8030/skillforge/main/frontend/src/assets/app.png)

### Trello Planning Board

![Trello Board](https://raw.githubusercontent.com/FHobbs8030/skillforge/stage-1-resubmit/frontend/src/assets/trello.png)

The existing image paths are intentionally preserved. Updated screenshots can replace the existing image files without requiring README changes.

---

## 🛣️ Roadmap

Planned improvements include:

- functional profile editing
- protected profile-update API
- password-change workflow
- account deletion safeguards
- GitHub account connection controls
- user-owned projects
- persistent work sections
- collaborator invitations
- role-based project permissions
- learning activity records
- progress analytics and streaks
- repository activity summaries
- notification and activity systems
- automated frontend and backend tests
- accessibility audits
- improved production logging
- custom domain support

---

## 📍 Project Status

### Authenticated Workspace Foundation — Complete

SkillForge now provides a connected public experience and a protected authenticated-member foundation. The frontend, backend, database, authentication system, deployment services, and GitHub API integration are connected and operational.

The next development phase is the **Profile Editing Foundation**.

---

## 👨‍💻 Author

### Fred Hobbs

- GitHub: [FHobbs8030](https://github.com/FHobbs8030)
- LinkedIn: [Fred Hobbs](https://www.linkedin.com/in/fred-hobbs-70aa9417a/)
- Portfolio: [Responsive Portfolio](https://fhobbs8030.github.io/responsive-portfolio/)
- Contact: [Portfolio Contact Section](https://fhobbs8030.github.io/responsive-portfolio/#contact)
