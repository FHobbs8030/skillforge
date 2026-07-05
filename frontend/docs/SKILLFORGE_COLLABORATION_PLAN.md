# SkillForge Collaboration Platform Plan

**Last updated:** June 30, 2026  
**Repository:** `FHobbs8030/skillforge`  
**Current development branch:** `feature/responsive-widget-dashboard`

---

## 1. Purpose

SkillForge is evolving from a personal developer learning tracker into a collaborative software-project workspace.

The platform will allow a project Host to:

- Create and organize software projects
- Connect a GitHub repository
- Define project goals
- Divide a project into manageable work sections
- Invite collaborators
- Monitor project-related collaborator activity
- Review submitted work
- Reassign or release stalled work
- Preserve contribution history
- Maintain final project oversight

Collaborators will be able to:

- Join approved projects
- Review project goals and Host instructions
- Browse available work sections
- Claim available work
- Complete work on their own schedule
- Connect GitHub activity to their assignment
- Submit work for review
- Release unfinished work for continuation
- Receive credit for their completed contributions

---

## 2. Existing SkillForge Application

The existing SkillForge application must remain functional.

### Existing routes

- `/` — Personal learning tracker
- `/profile` — Existing user profile
- `/host-preview` — New Host dashboard preview
- `/collaborator-preview` — Planned Collaborator dashboard preview

### Existing functionality

- GitHub username lookup
- Add learning entries
- Delete learning entries
- Track total entries
- Track total learning hours
- Display GitHub profile information
- Display clock and existing dashboard components

### Existing backend routes

- `GET /`
- `GET /health`
- `GET /github/:username`
- `POST /entries`
- `GET /entries`
- `DELETE /entries/:id`

The original learning tracker may later become a personal learning log or manual work log within the larger SkillForge platform.

---

## 3. Current Development Status

### Current phase

`Phase 2.4A — Host Dashboard Visual Foundation`

### Current branch

```text
feature/responsive-widget-dashboard
```

### Current rule

Do not stage or commit the Host dashboard design work until the visual layout is satisfactory.

### Current Host preview

The Host preview is available at:

```text
/host-preview
```

The current Host page includes:

- Host Mode heading
- Project Command Center heading
- Project Overview widget
- Create Work Section widget
- Responsive desktop and short-screen behavior
- Scrollable dashboard area on large, tall displays
- Normal page scrolling on shorter displays

### Current frontend component structure

```text
frontend/src/components/host/
  ProjectOverviewWidget/
  CreateWorkSectionWidget/
  SectionSummaryWidget/
  TeamLocalTimesWidget/
  WorkSectionCard/
  GitHubActivityWidget/

frontend/src/components/collaborator/
  AvailableSectionsWidget/
  HostAnnouncementsWidget/
  MyActivityWidget/
  MyWorkWidget/

frontend/src/components/shared/
  StatusBadge/
  WidgetPanel/
  EmptyState/
  ConfirmModal/

frontend/src/pages/
  HostDashboard/
  CollaboratorDashboard/

frontend/src/data/
  mockHostData.js
  mockCollaboratorData.js
```

Some component folders may remain empty until their implementation begins.

---

## 4. Product Roles

Roles are assigned per project.

A user may be:

- A Host on one project
- A Collaborator on another project
- A Collaborator on several projects
- A Host on several projects

Roles must not be stored as one permanent global user role.

### Host

The Host creates or manages a project and has final project authority.

Host responsibilities include:

- Defining the project goal
- Connecting the GitHub repository
- Creating work sections
- Setting section requirements
- Inviting collaborators
- Reviewing work
- Managing assignments
- Releasing stalled claims
- Transferring sections
- Publishing announcements
- Monitoring project activity
- Approving or requesting changes
- Archiving completed sections
- Maintaining project integrity

### Collaborator

A Collaborator participates in a project under the Host’s published structure.

Collaborator capabilities include:

- Viewing project goals
- Viewing Host announcements
- Viewing available work sections
- Claiming available sections
- Viewing their own assignment
- Updating progress
- Linking branches and pull requests
- Submitting work for review
- Reporting blockers
- Releasing unfinished work
- Viewing their own contribution history

Collaborators should not see private Host controls, private Host notes, administrative audit data, or account-level information belonging to other users.

---

## 5. Host Dashboard Design

The Host dashboard should provide a fast project overview without displaying every detail at once.

### Planned Host widgets

- Project Overview
- Create Work Section
- Section Summary
- Available Sections
- Claimed Sections
- Sections Under Review
- Blocked Sections
- Team Local Times
- Recent GitHub Activity
- Host Announcements
- Project Health
- Recent Collaborator Activity

### Dashboard information hierarchy

The large-screen dashboard should emphasize:

1. Overall project status
2. Work requiring Host attention
3. Primary Host actions
4. Current assignments
5. Recent project activity

Detailed information should open separately rather than overcrowding the dashboard.

---

## 6. Collaborator Dashboard Design

The Collaborator dashboard should focus on the collaborator’s assigned work and the Host’s published instructions.

### Planned Collaborator widgets

- Project Goal
- Host Announcements
- Available Sections
- My Claimed Work
- My Current Goal
- My Submissions
- My GitHub Activity
- My Local Time
- My Availability Status
- My Blockers
- My Contribution History

The Collaborator dashboard must not expose:

- Private Host notes
- Host override controls
- Full administrative audit logs
- Private account information
- Unrelated collaborator activity
- Sensitive project management controls

---

## 7. Responsive Layout Rules

### Large and tall screens

The application shell may keep the following visible:

- Header
- Main dashboard area
- Footer

The dashboard area may scroll independently when its content exceeds the available height.

### Wide but short screens

Use normal page scrolling.

Do not force all content into a fixed viewport.

### Tablet and mobile

Widgets should stack vertically.

Use normal vertical page scrolling.

Drawers may become full-screen sheets or dedicated pages on small screens.

### General layout rule

The dashboard should fit important summaries on one large screen, but detailed forms, histories, and large datasets should open in another interface layer.

Do not shrink complex content until it becomes difficult to read or use.

---

## 8. Information Display Patterns

SkillForge will use multiple layers of information.

### Dashboard widget

Used for:

- Status summaries
- Counts
- Important alerts
- Recent activity
- Primary actions

### Expandable panel or accordion

Used for:

- Small additional details
- Acceptance criteria
- Short lists
- Recent commits
- Secondary widget information

Chevrons may indicate expansion:

```text
⌄ Expand
⌃ Collapse
```

### Popover

Used for:

- Small action menus
- Status explanations
- Tooltips
- Very brief profile details

Popovers should not contain long forms or large datasets.

### Modal

Used for:

- Focused forms
- Create actions
- Edit actions
- Review workflows
- Confirmations
- Medium-sized profile previews

### Full-screen dialog

Used for:

- Complex forms
- Multi-step workflows
- Detailed reviews
- Project settings
- Large creation or editing tasks

### Side drawer

Used for:

- Collaborator details
- Work section details
- GitHub activity
- Assignment history
- Host controls
- Contextual information that should not fully replace the dashboard

### Dedicated page

Used for:

- Complete project history
- Large tables
- Analytics
- Audit logs
- Detailed pull request review
- Full section records
- Bookmarkable or shareable content

---

## 9. Collaborator Profile Interaction

A collaborator’s name or avatar may be selected from the Host dashboard.

### Interaction flow

```text
Collaborator name or avatar
        ↓
Profile preview
        ↓
View Full Profile
        ↓
Right-side drawer
        ↓
Open Full Profile Page
```

### Profile preview information

The preview may show:

- Medium or large avatar
- Display name
- GitHub username
- Project role
- Local time
- Availability status
- Current work section
- Last project activity
- View Full Profile button

### Full collaborator drawer

The drawer may include:

- Full name
- GitHub username
- GitHub profile link
- Larger avatar
- Project role
- Skills
- Approved location
- Time zone
- Local time
- Availability
- Current assignment
- Previous assignments
- Commits
- Pull requests
- Reviews
- Issues
- Blockers
- Contribution summary
- Assignment history
- Host-only controls

### Possible drawer tabs

```text
Overview | Work | GitHub | History
```

### Host-only actions

Possible Host controls include:

- Transfer section
- Release claim
- Extend claim
- Request update
- Send message
- Remove from project
- Suspend project access
- View complete project activity

Destructive or high-impact actions must require confirmation and create an audit record.

---

## 10. Work Section Lifecycle

A project is divided into work sections.

### Example work section states

```text
draft
available
claimed
in_progress
blocked
submitted
under_review
changes_requested
approved
completed
released
archived
```

### Claim rules

- A section normally allows one active claim
- The Host may allow multiple collaborators when appropriate
- Claims should be activity-based or time-limited
- Collaborators may release unfinished work
- The Host may release or transfer inactive work
- Previous work must not be erased
- Branches, commits, notes, and assignment history must remain available
- Each contributor must retain credit for their completed portion

### Continuation workflow

```text
Collaborator stops work
        ↓
Section becomes inactive or released
        ↓
Existing work and history are preserved
        ↓
Another collaborator claims the section
        ↓
New collaborator continues from the existing state
```

---

## 11. GitHub Integration

GitHub will provide repository and contribution data.

### GitHub may provide

- User profiles
- Avatars
- Usernames
- Repository information
- Commits
- Branches
- Pull requests
- Reviews
- Issues
- Changed files
- Repository collaborators
- Activity timestamps

### GitHub identity rule

Use the GitHub numeric user ID as the primary external identity reference.

Do not rely only on the GitHub username because usernames may change.

### GitHub remains the source of truth for

- Public GitHub profile fields
- Repository content
- Commit data
- Pull request data
- Review data
- Issue data
- Branch data

### SkillForge remains the source of truth for

- SkillForge accounts
- Project memberships
- Project roles
- Work section assignments
- Claim status
- Availability
- Host notes
- Announcements
- Consent records
- Audit history
- SkillForge notifications
- Project-specific status

---

## 12. MongoDB Atlas Profile Creation

When SkillForge discovers a GitHub collaborator, the backend may create or update a MongoDB Atlas profile document.

This process is called an upsert:

- Insert the document when it does not exist
- Update selected fields when it already exists

### Discovery flow

```text
Host connects repository
        ↓
Backend retrieves GitHub collaborators
        ↓
Backend checks MongoDB for each GitHub user
        ↓
Missing user → create discovered profile
Existing user → update approved GitHub fields
        ↓
Create or update project membership
```

Creating a database record does not automatically create a fully active SkillForge account.

### Suggested account states

```text
discovered
invited
pending_verification
active
suspended
removed
```

### Suggested user profile document

```js
{
  _id: ObjectId("..."),

  githubId: 12345678,
  githubUsername: "octocat",
  githubProfileUrl: "https://github.com/octocat",
  avatarUrl: "https://avatars.githubusercontent.com/...",

  displayName: "The Octocat",
  bio: "GitHub profile biography",
  company: null,
  publicLocation: "San Francisco",

  timezone: null,
  approvedDisplayLocation: null,

  email: null,
  accountStatus: "discovered",

  githubProfileLastSyncedAt: new Date(),

  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Suggested project membership document

```js
{
  _id: ObjectId("..."),

  projectId: ObjectId("..."),
  userId: ObjectId("..."),

  role: "collaborator",
  membershipStatus: "invited",
  availabilityStatus: "unknown",

  currentSectionId: null,

  invitedAt: new Date(),
  joinedAt: null,

  permissions: {
    canClaimSections: true,
    canViewTeamActivity: false
  },

  createdAt: new Date(),
  updatedAt: new Date()
}
```

User profiles and project memberships should remain separate.

---

## 13. Profile Synchronization

SkillForge should load stored profile data from MongoDB first.

GitHub fields may be refreshed periodically.

### Example synchronization strategy

```text
Load MongoDB profile immediately
        ↓
Check last GitHub synchronization time
        ↓
If stale, refresh GitHub fields in the background
        ↓
Update only GitHub-owned fields
```

### GitHub-owned fields

- `githubUsername`
- `githubProfileUrl`
- `avatarUrl`
- `displayName`
- `bio`
- `company`
- `publicLocation`

### SkillForge-owned fields

- `timezone`
- `approvedDisplayLocation`
- `availabilityStatus`
- `accountStatus`
- `policyAcceptances`
- `projectRoles`
- `hostNotes`
- `notificationPreferences`

GitHub synchronization must not overwrite SkillForge-owned fields.

### Avatar strategy

The first version should store the GitHub avatar URL.

A future version may cache an approved avatar in object storage if needed.

---

## 14. Registration and Consent

A GitHub-discovered user should not automatically receive active SkillForge access.

### Suggested activation flow

```text
GitHub collaborator discovered
        ↓
MongoDB profile created as discovered
        ↓
Project invitation sent
        ↓
User registers or signs in
        ↓
Email is verified
        ↓
GitHub identity is confirmed
        ↓
Policies and agreements are accepted
        ↓
Project membership becomes active
```

### Registration may include

- Account creation
- Email verification
- GitHub connection
- Display name
- Time zone
- Optional approved display location
- Terms of service acceptance
- Privacy policy acceptance
- Acceptable use policy acceptance
- GitHub data consent
- Project participation agreement

---

## 15. Privacy and Visibility

SkillForge should collect and display only information necessary for project collaboration.

### Host may see

- Project-related profile information
- Approved display name
- GitHub username
- Avatar
- Time zone
- Approved display location
- Current assignment
- Project-related GitHub activity
- Project-related contribution history
- Availability
- Blockers
- Assignment history
- Host-only project notes

### Host should not automatically see

- Street address
- Precise live location
- Private personal GitHub data without authorization
- Private activity unrelated to the project
- Hidden email addresses
- Unnecessary personal information

### Collaborators may see

- Published project goals
- Published Host announcements
- Available work sections
- Their own assignment
- Their own contribution history
- Approved shared team information
- Published review feedback

### Collaborators should not see

- Private Host notes
- Administrative audit tools
- Private account activity
- Host-only project controls
- Sensitive data belonging to other collaborators

---

## 16. Authorization and Security

Frontend visibility is not sufficient security.

The backend must enforce role and permission checks.

Unauthorized requests should return appropriate responses, including:

```text
401 Unauthorized
403 Forbidden
404 Not Found
```

### Backend authorization examples

Only a Host should be able to:

- Create project sections
- Transfer assignments
- Release another user’s claim
- Approve submitted work
- Archive sections
- Modify project settings
- View Host-only notes
- Access full audit records

Collaborators should only be able to modify information they are permitted to control.

### Security requirements

- Never expose MongoDB credentials
- Never expose GitHub tokens
- Store secrets in environment variables
- Validate all request data
- Sanitize user input
- Apply authorization on every protected route
- Record high-impact Host actions
- Protect private project data
- Use secure session or token handling
- Apply rate limiting where appropriate

---

## 17. Audit History

Important project actions should create audit records.

### Examples

- Work section created
- Work section edited
- Section claimed
- Claim released
- Assignment transferred
- Host override performed
- Submission approved
- Changes requested
- Collaborator removed
- Project settings changed
- Announcement published
- Membership role changed

### Suggested audit record

```js
{
  projectId: ObjectId("..."),
  actorUserId: ObjectId("..."),

  action: "assignment_transferred",

  targetType: "work_section",
  targetId: ObjectId("..."),

  previousValue: {
    assignedUserId: ObjectId("...")
  },

  newValue: {
    assignedUserId: ObjectId("...")
  },

  reason: "Original collaborator became inactive.",

  createdAt: new Date()
}
```

---

## 18. Planned MongoDB Collections

Possible collections include:

```text
users
projects
project_memberships
work_sections
section_assignments
section_updates
submissions
announcements
github_connections
github_activity
notifications
audit_logs
policy_acceptances
invitations
```

The final schema should avoid storing unrelated data in one oversized document.

---

## 19. Frontend and Backend Boundaries

### Frontend responsibilities

- Display dashboards
- Display forms
- Display summaries
- Open modals and drawers
- Manage temporary interface state
- Submit API requests
- Display validation and server responses
- Enforce presentation-level visibility

### Backend responsibilities

- Authenticate users
- Authorize actions
- Validate data
- Manage MongoDB records
- Synchronize GitHub data
- Protect credentials
- Enforce project roles
- Enforce work claim rules
- Create audit records
- Generate notifications
- Prevent conflicting assignments

Frontend restrictions must never replace backend authorization.

---

## 20. Development Sequence

### Phase A — Host visual design

- Complete Host dashboard layout
- Convert large forms into compact dashboard actions
- Add Host summary widgets
- Add responsive behavior
- Design collaborator profile preview
- Design collaborator side drawer
- Design work section detail drawer
- Validate desktop, short-screen, tablet, and mobile layouts

### Phase B — Collaborator visual design

- Build Collaborator dashboard
- Add project goal
- Add Host announcements
- Add available sections
- Add claimed work
- Add current goal
- Add submission status
- Add personal GitHub activity
- Validate responsive layouts

### Phase C — Shared component cleanup

- Widget panel
- Status badge
- Empty state
- Confirmation modal
- Drawer
- Full-screen dialog
- Profile preview
- Section card
- Tabs
- Loading and error states

### Phase D — Host backend integration

- Projects
- Memberships
- Work sections
- Assignments
- Announcements
- Host permissions
- GitHub repository connection
- Collaborator discovery
- Profile upserts
- Audit logging

### Phase E — Collaborator backend integration

- Invitations
- Registration
- Project joining
- Section claims
- Progress updates
- Submissions
- Releases
- Notifications
- GitHub activity linking

### Phase F — Authentication and authorization

- User authentication
- Email verification
- GitHub identity connection
- Role-based authorization
- Consent records
- Protected routes
- Secure sessions or tokens

### Phase G — Production hardening

- Validation
- Error handling
- Logging
- Rate limiting
- Security review
- Accessibility review
- Performance testing
- Responsive testing
- Deployment validation

---

## 21. Immediate Design Direction

The current Create Work Section form uses too much dashboard space.

The preferred direction is:

```text
Compact Create Work Section widget
        ↓
Host selects Create Section
        ↓
Full-screen dialog or large modal opens
        ↓
Host completes the detailed form
        ↓
New work section appears in the dashboard
```

Collaborator details should use:

```text
Name or avatar
        ↓
Profile preview
        ↓
Right-side drawer
        ↓
Dedicated full profile page when required
```

Work section details should use:

```text
Section summary card
        ↓
Right-side drawer
        ↓
Dedicated section page for full history
```

---

## 22. Design Principles

- Functionality before layout
- Build one feature at a time
- Use design, build, and improve cycles
- Maintain one clear primary action
- Use existing design tokens
- Avoid random colors and spacing values
- Reduce visual noise
- Use whitespace intentionally
- Keep summaries clear
- Move complex information outside the dashboard
- Preserve responsive behavior
- Keep the original application working
- Do not connect unfinished visual mockups to production data
- Do not commit the current Host design until it is approved

---

## 23. Current Next Step

The next Host dashboard change should be:

1. Convert Create Work Section into a compact action widget
2. Move the complete form into a modal or full-screen dialog
3. Confirm the dashboard and footer layout
4. Add Section Summary
5. Add Team Local Times
6. Create collaborator profile preview
7. Create collaborator detail drawer

All current Host dashboard design work should remain uncommitted until the layout is approved.
