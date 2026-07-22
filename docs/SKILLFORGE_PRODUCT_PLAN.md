# SkillForge Product Plan

**Status:** LOCKED PRODUCT PLAN
**Last Updated:** July 21, 2026
**Repository:** `FHobbs8030/skillforge`

## 1. Product North Star

**SkillForge is a B2B SaaS project collaboration platform for software development companies.**

Companies subscribe to SkillForge and create organization workspaces where their development teams can organize, host, collaborate on, track, and complete software projects.

- **Company = Customer**
- **Employees = Users**
- **SkillForge = Tool**

```text
Company
  ↓
30-Day Free Trial
  ↓
Organization Workspace
  ↓
Employees / Team Members
  ↓
Projects
  ↓
Hosts + Collaborators + Viewers
  ↓
Tasks + Kanban + GitHub + Activity
  ↓
Paid Company Subscription
```

This direction is locked and must not change casually.

## 2. Customer and User Model

### Customer
The paying customer is a company or software development organization.

### Users
Employees use SkillForge through their company workspace. Individual developers are not expected to pay personally to participate in company work.

### Company Controls
- Organization membership
- Administrative access
- Project creation
- Team assignment
- Which developers serve as Hosts
- Which developers participate as Collaborators or Viewers
- Connected repositories
- Internal project workflows

### SkillForge Provides
- Organization workspaces
- Team membership
- Project lifecycle management
- Project roles and permissions
- Task management
- Kanban workflows
- GitHub integration
- Activity history
- Trial/subscription access
- Company administration

SkillForge should remain as self-service as practical so companies can operate with minimal manual intervention.

## 3. Target Product Hierarchy

```text
Organization / Company
  ├── Organization Owner
  ├── Administrators
  └── Members / Employees
        └── Projects
              ├── Host
              ├── Collaborators
              ├── Viewers
              ├── Tasks
              ├── Kanban
              ├── GitHub Repository
              └── Activity History
```

### Organization Roles
- Owner
- Administrator
- Member

### Project Roles
- Host
- Collaborator
- Viewer

Organization roles control company-level authority. Project roles control responsibility inside a specific project.

## 4. Trial and Subscription Model

### Public Preview
SkillForge may continue to offer Host and Collaborator previews without signup. These are product previews, not the commercial model.

### 30-Day Free Trial

```text
Company discovers SkillForge
  ↓
Starts 30-Day Free Trial
  ↓
Creates Organization Workspace
  ↓
Invites Team Members
  ↓
Creates Real Projects
  ↓
Assigns Hosts and Collaborators
  ↓
Uses Tasks / GitHub / Activity / Kanban
  ↓
Evaluates SkillForge
  ↓
Chooses Paid Subscription
```

The trial belongs to the organization workspace, not separately to each employee.

Preferred trial expiration behavior:

```text
Trial Active
  ↓
30 Days
  ↓
Trial Expired
  ↓
Workspace becomes restricted/read-only
  ↓
Company subscribes
  ↓
Full access restored
```

Do not automatically destroy project data when a trial expires.

Exact pricing, billing provider, plan limits, and whether a credit card is required for trial are not yet locked.

## 5. Existing SkillForge Foundation

The following systems remain valid and reusable:

- Authentication and session restoration
- Protected/public routing
- User profiles
- MongoDB persistence and validation
- Responsive Day/Night UI
- Project creation, detail, settings, lifecycle, archive, history
- Project memberships and invitations
- Owner / Host / Collaborator / Viewer role concepts
- GitHub integration
- Activity/event history
- Host Preview and Collaborator Preview
- Project Tasks Foundation

### Latest Completed Milestone

```text
PR #22 — Add project task foundation
Merge commit: 5f70a4e
Feature commit: ce07170 — Add project task foundation
```

Existing work is not being discarded. The organization/company layer will be added around the project-level systems already built.

## 6. Locked Development Roadmap

### Phase 1 — Existing SkillForge Foundation
**Status:** COMPLETE

Authentication, profiles, projects, collaboration, invitations, GitHub integration, activity history, themes, responsiveness, and deployment.

### Phase 2 — Project Tasks Foundation
**Status:** COMPLETE

Delivered:
- `ProjectTask` model
- Task listing
- Task creation
- Validation
- Assignment rules
- Role-aware access
- Activity logging

### Phase 3 — Project Task Management
**Status:** NEXT

Planned:
- View individual task
- Edit task
- Change status and priority
- Assign/reassign members
- Manage due dates
- Complete tasks
- Archive/delete where appropriate
- Role-aware update permissions
- Task lifecycle activity events

Target routes:

```text
GET    /projects/:projectId/tasks/:taskId
PATCH  /projects/:projectId/tasks/:taskId
DELETE /projects/:projectId/tasks/:taskId
```

### Architecture Checkpoint
After Project Task Management:
- Validate data model and authorization boundaries
- Confirm organization migration strategy
- Preserve a stable release checkpoint
- Finalize organization-scoping implementation sequence

This checkpoint does not redefine the product direction.

### Phase 4 — Organization Foundation
Introduce:

```text
Organization
OrganizationMembership
```

No full billing integration yet.

### Phase 5 — Organization Membership and Company Roles
Implement:
- Organization Owner
- Administrator
- Member
- Organization invitations
- Membership status and permissions
- Company-managed employee access

### Phase 6 — Organization-Scoped Projects

```text
Organization
  ↓
Projects
  ↓
Project Memberships
```

Requirements:
- Add organization ownership/scoping to projects
- Prevent cross-organization access
- Update authorization rules
- Update project creation flow
- Preserve existing project data through controlled migration

### Phase 7 — Task Management UI
Build:
- Task list/detail/create/edit
- Assignment
- Priority/status controls
- Due dates
- Completion/archive lifecycle
- Loading/error/empty states
- Responsive behavior

### Phase 8 — Kanban Workspace

```text
BACKLOG → TODO → IN PROGRESS → REVIEW → COMPLETED
```

Use the same canonical task model and APIs. Do not create a duplicate task system.

### Phase 9 — Company Dashboard
Company-level visibility for:
- Active projects
- Team members
- Project Hosts
- Task summaries
- Recent activity
- Project progress/health
- Organization navigation

### Phase 10 — 30-Day Trial and Subscription Foundation
Target states may include:

```text
trialing
active
past_due
restricted
cancelled
```

Implement trial start/expiration, access restrictions, read-only behavior where appropriate, and subscription-state checks. Do not add payment processing until this state model is stable.

### Phase 11 — Billing Integration
Possible capabilities:
- Subscription checkout
- Billing customer
- Plan selection
- Renewal/cancellation
- Payment failure handling
- Billing portal
- Seat/project limits if needed

The company pays. Employees use the company workspace.

### Phase 12 — Production SaaS Polish
Complete:
- Permission audit
- Security review
- Organization isolation testing
- Error/loading/empty states
- Responsive QA
- Accessibility review
- Trial/subscription edge cases
- Deployment validation
- Preview validation
- Documentation and onboarding polish

### Phase 13 — Major SkillForge Release
Prepare:
- Release tag
- Updated README and architecture docs
- Updated screenshots
- Updated LinkedIn/portfolio presentation
- Major milestone post

## 7. Scope Control Rules

### Rule 1 — Finish the Current Phase

```text
Define Scope
  ↓
Build
  ↓
Test
  ↓
Validate
  ↓
Commit
  ↓
Pull Request
  ↓
Merge
  ↓
Cleanup
  ↓
Update Product Plan
  ↓
Next Phase
```

Do not abandon an active phase for a new idea unless a genuine architectural blocker is discovered.

### Rule 2 — New Ideas Do Not Automatically Change the Roadmap
Every new idea must be classified as one of:

```text
CURRENT ROADMAP REQUIREMENT
FUTURE / PARKING LOT
APPROVED PLAN CHANGE
```

### Rule 3 — Significant Changes Require an Architecture Checkpoint
Before changing the locked roadmap, answer:
1. What problem does this solve?
2. Is it required for the locked North Star?
3. Does it invalidate or significantly rework existing systems?
4. Does it belong now, later, or in the Parking Lot?

Then explicitly classify it as:

```text
APPROVED PLAN CHANGE
```

or

```text
DEFERRED — PARKING LOT
```

Until explicitly approved, the roadmap remains unchanged.

### Rule 4 — Preserve One Canonical Architecture
Do not create duplicate systems for the same concept.

Examples:
- One canonical task model
- One canonical membership model per scope
- One canonical permission path
- One canonical activity history
- One canonical GitHub integration path

### Rule 5 — Preserve Stable Milestones
Use Git tags/releases before major architecture changes. Preserve the current collaboration-focused SkillForge generation before organization migration begins.

### Rule 6 — Do Not Build Billing Too Early
Organization structure and product workflow must work before payment processing is introduced. Billing controls commercial access; it must not define the core architecture.

## 8. Future / Parking Lot

The following are not part of the locked near-term roadmap unless explicitly promoted through an approved plan change:

- AI project summaries
- AI task assistance
- Advanced predictive analytics
- Slack integration
- Microsoft Teams integration
- Additional repository providers
- Enterprise SSO
- Native mobile apps
- Recruiting marketplace
- Freelance marketplace
- Public developer talent marketplace
- Built-in payroll/payment distribution
- Video meetings
- Chat/messaging systems that duplicate established platforms

Parking Lot items may be valuable later, but they must not derail the approved roadmap.

## 9. Product Decisions Currently Locked

### Locked
- SkillForge is B2B SaaS.
- Companies/organizations are the paying customers.
- Employees/development teams are the users.
- SkillForge is a project collaboration tool, not an employer or labor marketplace.
- Companies create organization workspaces.
- Companies manage their own members and projects.
- Project-level Host and Collaborator concepts remain important.
- A company-level organization layer will be added.
- Public Host/Collaborator previews may remain for no-friction evaluation.
- Prospective company customers receive a 30-day trial path.
- The organization—not each employee—owns the commercial subscription relationship.
- Project Task Management is the next development phase.
- Organization architecture follows the Project Task Management checkpoint.
- Billing comes after organization and workflow architecture are stable.

### Not Yet Locked
- Exact monthly/annual pricing
- Exact plan tiers
- Exact seat/project/storage limits
- Billing provider
- Credit-card requirement for trial
- Enterprise pricing
- Trial reminder schedule
- Cancellation/grace-period policy
- Exact name of the first major SaaS release

These decisions will be made when their roadmap phase is reached.

## 10. Release and LinkedIn Strategy

The currently deployed SkillForge remains a valid milestone and portfolio project.

Major future changes should not be exposed as half-finished production work.

```text
Stable Production SkillForge
  ↓ remains available while
Feature / Integration Branches
  ↓
Build and test next generation
  ↓
Validated Major Release
  ↓
Production Deployment
  ↓
New LinkedIn / Portfolio Milestone Post
```

Future LinkedIn posts should communicate meaningful release milestones rather than every internal development step.

Possible progression:

```text
SkillForge Collaboration Foundation
  ↓
SkillForge Organization Platform
  ↓
SkillForge Production SaaS Release
```

## 11. Current Development Checkpoint

As of July 21, 2026:

```text
Main:
5f70a4e — Merge pull request #22 from FHobbs8030/feature/project-tasks-foundation

Completed:
Project Tasks Foundation

Next Development Phase:
Project Task Management

Planned Feature Branch:
feature/project-task-management
```

A temporary documentation branch is currently being used to isolate LinkedIn/social assets:

```text
docs/linkedin-social-assets
```

That documentation/social cleanup must remain separate from feature implementation.

## 12. Handoff Contract

Every future SkillForge handoff must include:

```text
SKILLFORGE NORTH STAR
B2B SaaS project collaboration platform for software development companies.

CUSTOMER
Company / Organization

USERS
Company employees / development teams

BUSINESS MODEL
30-day organization trial → paid company subscription

TARGET HIERARCHY
Organization → Members → Projects → Hosts/Collaborators → Tasks/Kanban/GitHub/Activity

CURRENT PHASE
[phase name]

NEXT PHASE
[phase name]

PLAN STATUS
LOCKED

PARKING LOT
[new deferred ideas, if any]
```

New chats, ideas, implementation discoveries, and UI improvements must not silently redefine the product.

## 13. Final Product Goal

> **Build SkillForge into a polished, secure, self-service B2B SaaS collaboration platform that software development companies subscribe to in order to organize teams, assign project leadership, collaborate on software projects, manage tasks and Kanban workflows, connect GitHub activity, track project history, and move projects from initiation through completion.**

Success means:

```text
Company signs up
  ↓
Starts 30-Day Trial
  ↓
Creates Organization
  ↓
Invites Employees
  ↓
Creates Projects
  ↓
Assigns Hosts and Collaborators
  ↓
Teams Manage Tasks / Kanban / GitHub / Activity
  ↓
Projects Move to Completion
  ↓
Company Subscribes and Continues Using SkillForge
```

That is the locked direction of SkillForge.

## Change Log

### July 21, 2026 — Product Direction Locked

Established:
- B2B SaaS positioning
- Company-as-customer model
- Employee-as-user model
- Organization workspace architecture
- 30-day organization trial direction
- Public preview strategy
- Locked phased roadmap
- Scope-control rules
- Parking Lot process
- Handoff contract

This plan should only be changed through an explicit, documented product or architecture decision.
