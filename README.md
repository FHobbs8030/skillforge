# 🚀 SkillForge

> A full-stack developer collaboration workspace for creating projects, connecting repositories, managing team access, and tracking project activity.

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
![Current Phase](https://img.shields.io/badge/Phase-Project%20Collaboration-blue)

---

## 📌 Overview

**SkillForge** is a responsive full-stack application built to help developers organize projects, collaborate with distributed team members, connect GitHub repositories, and maintain a visible history of project activity.

The application began as a developer learning tracker and has evolved into a role-aware collaboration platform with:

- a public product experience and interactive demo
- secure account registration and authentication
- persistent authenticated sessions
- editable user profiles
- user-owned project workspaces
- project creation, editing, and archival controls
- GitHub repository connections
- collaborator invitations and invitation responses
- role-based project access
- project membership management
- activity timelines
- persistent Day and Night themes
- responsive layouts from desktop through 320px mobile screens

SkillForge is designed around a simple product model: one account can hold different roles across different projects. A user may own one project, host another, collaborate on a third, and have read-only access to another.

---

## 🌐 Live Application

| Service | Link | Status |
| --- | --- | --- |
| Frontend | [Open SkillForge](https://adorable-granita-db1df3.netlify.app/) | Live on Netlify |
| Backend API | [Open API](https://skillforge-api-cuw0.onrender.com) | Live on Render |
| Health check | [Check API health](https://skillforge-api-cuw0.onrender.com/health) | Operational |
| Repository | [FHobbs8030/skillforge](https://github.com/FHobbs8030/skillforge) | Source code |

```text
Netlify Frontend
      ↓ HTTPS / JSON
Render Express API
      ├── MongoDB Atlas
      └── GitHub REST API
```

Netlify deploys the frontend from `main`. Render hosts the Express API, which communicates with MongoDB Atlas and the GitHub REST API.

---

## 📊 Application Preview

SkillForge supports persistent **Day Mode** and **Night Mode** themes. Day Mode screenshots are shown on the left. The right column is reserved for matching Night Mode screenshots.

> Save screenshots in `frontend/src/assets/` using the filenames shown below. The five Night Mode cells are already prepared for the matching files.

<table>
  <thead>
    <tr>
      <th width="50%" align="center">☀️ Day Mode</th>
      <th width="50%" align="center">🌙 Night Mode</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">
        <img src="./frontend/src/assets/skillforge-day-01.png" alt="SkillForge Day Mode screenshot 1" width="100%" />
      </td>
      <td align="center">
        <img src="./frontend/src/assets/skillforge-night-01.png" alt="SkillForge Night Mode screenshot 1" width="100%" />
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="./frontend/src/assets/skillforge-day-02.png" alt="SkillForge Day Mode screenshot 2" width="100%" />
      </td>
      <td align="center">
        <img src="./frontend/src/assets/skillforge-night-02.png" alt="SkillForge Night Mode screenshot 2" width="100%" />
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="./frontend/src/assets/skillforge-day-03.png" alt="SkillForge Day Mode screenshot 3" width="100%" />
      </td>
      <td align="center">
        <img src="./frontend/src/assets/skillforge-night-03.png" alt="SkillForge Night Mode screenshot 3" width="100%" />
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="./frontend/src/assets/skillforge-day-04.png" alt="SkillForge Day Mode screenshot 4" width="100%" />
      </td>
      <td align="center">
        <img src="./frontend/src/assets/skillforge-night-04.png" alt="SkillForge Night Mode screenshot 4" width="100%" />
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="./frontend/src/assets/skillforge-day-05.png" alt="SkillForge Day Mode screenshot 5" width="100%" />
      </td>
      <td align="center">
        <img src="./frontend/src/assets/skillforge-night-05.png" alt="SkillForge Night Mode screenshot 5" width="100%" />
      </td>
    </tr>
  </tbody>
</table>

---

## ✨ Core Features

### Public Product Experience

- Responsive welcome page with product messaging
- Interactive demo mission
- Host workspace preview
- Collaborator workspace preview
- Public navigation with active-route states
- External GitHub, LinkedIn, portfolio, and contact links
- Day Mode contrast support across the public experience

### Authentication and Sessions

- Account registration with full name, email, password, and membership selection
- Free, Pro, and Team membership options
- Password hashing with `bcryptjs`
- JWT-based sign-in
- Protected current-user endpoint
- Persistent browser session restoration
- Sign-out support
- Public-only and protected route guards
- Duplicate-email protection
- Normalized email storage

### Authenticated Dashboard

- Dedicated member dashboard at `/app`
- Overview, Workspace, Activity, and Account sections
- Authenticated user identity display
- Active-project metrics
- Role-aware project access cards
- Pending invitation panel
- Accept and decline invitation actions
- Automatic project refresh after invitation acceptance
- Responsive authenticated navigation

### Profile Management

- Protected profile page at `/profile`
- Full name and email editing
- Backend profile update validation
- Duplicate-email protection
- Immediate authenticated-user state refresh
- Save, cancel, loading, success, and error states
- Persistent profile changes in MongoDB
- Responsive profile layout

### Project Workspaces

- Protected project history page
- Create-project workflow
- Project summary metrics
- Clickable project cards
- Protected project detail pages
- Project overview and access information
- Role-aware content and controls
- Project settings for authorized users
- Project status and visibility management
- Owner-only project archival
- Responsive project layouts aligned with the authenticated header shell

### GitHub Repository Connection

- Connect a GitHub repository to a project
- Validate GitHub HTTPS repository URLs
- Retrieve repository metadata through the GitHub API
- Display repository owner, name, URL, default branch, update date, and sync date
- Update an existing project repository connection
- Record repository connection activity in the project timeline
- Restrict repository controls to authorized project roles

### Collaboration and Invitations

- Project member listing
- Member name, email, project role, account membership, status, and joined date
- Invite registered users by email
- Assign Host, Collaborator, or Viewer access
- Owner and Host invitation permissions
- Validation for missing users and existing members
- Pending invitation retrieval
- Invitation acceptance and decline flows
- Role-aware dashboard access after accepting an invitation
- Read-only messaging for non-management roles

### Activity History

Project activity is persisted as timeline events, including:

- project creation
- project updates
- project archival
- repository connections
- member invitations
- invitation acceptance
- invitation decline

### Day and Night Themes

- Persistent theme selection through `localStorage`
- Authenticated header theme toggle
- Night Mode preserves the original black, green, and cyan visual system
- Day Mode uses a softer blue-gray color system
- Theme-specific contrast passes for:
  - Welcome
  - Dashboard
  - Projects
  - Profile
  - Collaborator Demo

---

## 👥 Project Roles

| Role | Typical Access |
| --- | --- |
| **Owner** | Full project control, project settings, member invitations, repository management, and lifecycle controls |
| **Host** | Project management, member invitations, repository controls, and editable project settings |
| **Collaborator** | Active project participation with role-aware workspace access |
| **Viewer** | Read-only project access |
| **Member** | Fallback project access when no specialized role applies |

Role permissions are evaluated per project. A single SkillForge account can hold different roles across multiple projects.

---

## 🧭 Primary Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Welcome and product introduction |
| `/demo` | Public | Interactive SkillForge demo mission |
| `/host-preview` | Public | Host workspace preview |
| `/collaborator-preview` | Public | Collaborator workspace preview |
| `/signup` | Public only | Account registration |
| `/signin` | Public only | Account sign-in |
| `/app` | Protected | Authenticated dashboard |
| `/profile` | Protected | Profile and account management |
| `/projects` | Protected | Project history and project creation |
| `/projects/:projectId` | Protected | Role-aware project detail workspace |

---

## 🏗️ Architecture

```text
Browser
└── React 19 + Vite 8
    ├── React Router
    ├── Authentication context
    ├── Theme context
    ├── Public-only route guards
    ├── Protected route guards
    ├── Welcome and demo experiences
    ├── Authenticated dashboard
    ├── Profile management
    ├── Project history
    ├── Project detail workspaces
    ├── Invitation response UI
    └── Responsive CSS system
            ↓ HTTPS / JSON
Render
└── Node.js + Express 5
    ├── Authentication routes
    ├── Project routes
    ├── Request validation
    ├── JWT middleware
    ├── Role and membership authorization
    ├── Password hashing
    ├── GitHub API integration
    ├── Error handling
    └── MongoDB Atlas
        ├── Users
        ├── Projects
        ├── Project memberships
        └── Activity events
```

### Authentication Flow

```text
Sign Up
  ↓
Validate account fields
  ↓
Hash password
  ↓
Store user in MongoDB Atlas

Sign In
  ↓
Validate credentials
  ↓
Compare password hash
  ↓
Issue JWT
  ↓
Store browser session
  ↓
Restore user through GET /auth/me
  ↓
Allow protected route access
```

### Project Creation Flow

```text
Authenticated user
  ↓
Create project
  ↓
Create owner membership
  ↓
Create project_created activity event
  ↓
Open project detail workspace
```

### Invitation Flow

```text
Owner or Host invites registered user
  ↓
Create invited project membership
  ↓
Display invitation on recipient dashboard
  ↓
Recipient accepts or declines
  ↓
Update membership status
  ↓
Record invitation response in activity timeline
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
- Context-based authentication and theme state
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

### Data and Integrations

- MongoDB Atlas
- GitHub REST API

### Deployment

- Netlify — frontend hosting and continuous deployment
- Render — backend API hosting
- GitHub — source control and deployment integration

---

## 🔌 API Overview

### Authentication

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Public | Create an account |
| `POST` | `/auth/signin` | Public | Validate credentials and return a JWT |
| `GET` | `/auth/me` | Bearer token | Return the authenticated user |
| `PATCH` | `/auth/me` | Bearer token | Update the authenticated profile |

### Projects

Project routes are mounted under `/projects`.

| Method | Endpoint | Purpose |
| --- | --- |
| `GET` | `/projects` | List projects for the authenticated user |
| `POST` | `/projects` | Create a project and owner membership |
| `GET` | `/projects/invitations/pending` | List pending invitations |
| `PATCH` | `/projects/:projectId/invitations/accept` | Accept an invitation |
| `PATCH` | `/projects/:projectId/invitations/decline` | Decline an invitation |
| `GET` | `/projects/:projectId` | Load project detail |
| `PATCH` | `/projects/:projectId` | Update project settings |
| `PATCH` | `/projects/:projectId/archive` | Archive a project |
| `GET` | `/projects/:projectId/activity` | Load project activity |
| `GET` | `/projects/:projectId/members` | List project members |
| `POST` | `/projects/:projectId/members/invite` | Invite a registered user |
| `PUT` | `/projects/:projectId/repository` | Connect or update a GitHub repository |

### Other Endpoints

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Confirm the API is running |
| `GET` | `/health` | Public | Return API health status |
| `GET` | `/github/:username` | Public | Retrieve a GitHub profile and repositories |

Protected requests use:

```http
Authorization: Bearer <jwt-token>
```

---

## 🔐 Security and Authorization

- Passwords are never stored in plain text
- Passwords are hashed with bcrypt
- JWTs protect authenticated API routes
- Email addresses are normalized before storage
- Duplicate accounts are rejected
- Password hashes are excluded from normal responses
- Project access requires an active membership
- Project editing is restricted to Owners and Hosts
- Repository management is restricted to Owners and Hosts
- Member invitations are restricted to Owners and Hosts
- Project archival is restricted to Owners
- GitHub repository URLs are validated
- Production CORS access is restricted to the deployed frontend
- Localhost origins are supported during development
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
│   │   ├── ActivityEvent.js
│   │   ├── Project.js
│   │   ├── ProjectMembership.js
│   │   └── User.js
│   ├── routes/
│   │   └── projects.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── docs/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── data/
│   │   ├── pages/
│   │   │   ├── AppDashboard/
│   │   │   ├── AuthPage/
│   │   │   ├── CollaboratorDashboard/
│   │   │   ├── DemoMission/
│   │   │   ├── HostDashboard/
│   │   │   ├── ProfilePage/
│   │   │   ├── ProjectDetail/
│   │   │   ├── ProjectHistory/
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

## ⚙️ Local Development

### 1. Clone the repository

```bash
git clone https://github.com/FHobbs8030/skillforge.git
cd skillforge
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create `backend/.env`:

```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=1h
```

### 4. Start the backend

```bash
npm run dev
```

The local API runs at:

```text
http://localhost:3001
```

### 5. Install frontend dependencies

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

### 6. Configure the frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### 7. Start the frontend

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal.

The deployed frontend uses:

```env
VITE_API_URL=https://skillforge-api-cuw0.onrender.com
```

---

## ✅ Validation

Run the frontend checks from the repository root:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
git diff --check
```

Check the backend project routes:

```bash
node --check backend/routes/projects.js
```

Start the backend for runtime validation:

```bash
npm --prefix backend run dev
```

Current functionality has been validated for:

- frontend production builds
- clean whitespace checks
- public and protected routing
- account registration and sign-in
- persistent session restoration
- authenticated profile editing
- project listing and creation
- project detail navigation
- project setting updates
- project archival
- GitHub repository connection
- member listing and invitations
- invitation acceptance and decline
- role-aware dashboard access
- project activity history
- Day and Night theme persistence
- responsive desktop, tablet, and mobile layouts
- Netlify-to-Render communication
- MongoDB Atlas connectivity
- GitHub API responses

---

## 🧩 Recent Milestones

| Milestone | Status |
| --- | --- |
| Public welcome and demo experience | Complete |
| Authentication and session foundation | Complete |
| Authenticated dashboard | Complete |
| Profile editing | Complete |
| Project data foundation | Complete |
| Project history and activity UI | Complete |
| Project detail workspace | Complete |
| GitHub repository connection | Complete |
| Project member listing | Complete |
| Project member invitations | Complete |
| Invitation response flow | Complete |
| Role-based dashboard access | Complete |
| Role-aware permission display | Complete |
| Project creation UI | Complete |
| Project editing UI | Complete |
| Project lifecycle archive controls | Complete |
| Persistent Day/Night theme toggle | Complete |

---

## 🛣️ Roadmap

Potential next phases include:

- project member role editing
- member removal and invitation cancellation
- repository synchronization controls
- project tasks and work sections
- task assignment and completion tracking
- comments and project communication
- notifications
- learning activity records
- project progress analytics
- GitHub activity summaries
- automated frontend and backend tests
- accessibility audits
- production monitoring and structured logging
- custom domain support

---

## 📍 Project Status

### Project Collaboration Foundation — Complete

SkillForge now provides a connected public experience, secure authenticated accounts, editable profiles, project creation and management, GitHub repository connections, role-aware collaboration, invitation workflows, activity history, project lifecycle controls, and persistent Day/Night themes.

The project is live and under active development.

---

## 👨‍💻 Author

### Fred Hobbs

- GitHub: [FHobbs8030](https://github.com/FHobbs8030)
- LinkedIn: [Fred Hobbs](https://www.linkedin.com/in/fred-hobbs-70aa9417a/)
- Portfolio: [Responsive Portfolio](https://fhobbs8030.github.io/responsive-portfolio/)
- Contact: [Portfolio Contact Section](https://fhobbs8030.github.io/responsive-portfolio/#contact)
