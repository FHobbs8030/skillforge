export const mockCollaborators = [
  {
    id: "maya-chen",
    name: "Maya Chen",
    initials: "MC",
    role: "Frontend Engineer",
    location: "Toronto, Canada",
    timeZone: "America/Toronto",
    workHours: {
      start: 9,
      end: 18,
    },
  },
  {
    id: "jordan-lee",
    name: "Jordan Lee",
    initials: "JL",
    role: "UI/UX Designer",
    location: "Austin, Texas",
    timeZone: "America/Chicago",
    workHours: {
      start: 9,
      end: 17,
    },
  },
  {
    id: "mateo-ruiz",
    name: "Mateo Ruiz",
    initials: "MR",
    role: "Backend Engineer",
    location: "Madrid, Spain",
    timeZone: "Europe/Madrid",
    workHours: {
      start: 9,
      end: 18,
    },
  },
  {
    id: "priya-shah",
    name: "Priya Shah",
    initials: "PS",
    role: "QA and Documentation",
    location: "Bengaluru, India",
    timeZone: "Asia/Kolkata",
    workHours: {
      start: 9,
      end: 18,
    },
  },
];

export const mockCollaboratorDashboard = {
  collaborator: {
    id: "maya-chen",
    name: "Maya Chen",
    initials: "MC",
    role: "Frontend Engineer",
    location: "Toronto, Canada",
    timeZoneLabel: "Eastern Time",
    githubUsername: "mayachen-dev",
    membershipRole: "Collaborator",
  },

  activeProject: {
    id: "skillforge",
    name: "SkillForge",
    status: "Active",
    hostName: "Fred Hobbs",
    description:
      "A communication-first project workspace for organizing development work, tracking progress, and helping distributed teams collaborate clearly.",
    nextCheckIn: "Wednesday at 10:00 AM",
    nextPriority:
      "Complete the responsive collaborator workspace and confirm the communication workflow.",
  },

  summary: [
    {
      id: "assigned",
      label: "Assigned Work",
      value: 2,
      detail: "1 currently in progress",
      tone: "blue",
    },
    {
      id: "available",
      label: "Available Work",
      value: 2,
      detail: "Ready to be claimed",
      tone: "teal",
    },
    {
      id: "messages",
      label: "New Messages",
      value: 2,
      detail: "1 requires a response",
      tone: "orange",
    },
    {
      id: "blockers",
      label: "Open Blockers",
      value: 1,
      detail: "Host has been notified",
      tone: "red",
    },
  ],

  myWork: [
    {
      id: "collaborator-dashboard-shell",
      title: "Collaborator Dashboard Shell",
      status: "in-progress",
      statusLabel: "In Progress",
      progress: 65,
      priority: "High",
      dueDate: "July 3",
      updatedAt: "Updated 12 minutes ago",
      hostNote:
        "Focus on a clear responsive structure before connecting live project data.",
      acceptanceCriteria: [
        "Works on desktop, tablet, and mobile",
        "Clearly separates work and communication",
        "Uses plain language throughout",
      ],
    },
    {
      id: "authentication-copy-review",
      title: "Authentication Copy Review",
      status: "ready-for-review",
      statusLabel: "Ready for Review",
      progress: 100,
      priority: "Medium",
      dueDate: "July 5",
      updatedAt: "Updated yesterday",
      hostNote:
        "Check that Sign In and Register instructions are understandable to new users.",
      acceptanceCriteria: [
        "Registration language is easy to understand",
        "Error messages explain how to correct a problem",
        "Host and collaborator roles are not confused with account creation",
      ],
    },
  ],

  availableWork: [
    {
      id: "empty-state-guidance",
      title: "Empty-State Guidance",
      description:
        "Create friendly guidance for pages that do not yet contain assigned work, messages, or activity.",
      priority: "Medium",
      estimatedHours: "2–3 hours",
      skills: ["UX Writing", "React"],
    },
    {
      id: "mobile-navigation-review",
      title: "Mobile Navigation Review",
      description:
        "Review dashboard navigation at narrow screen sizes and document any usability issues.",
      priority: "High",
      estimatedHours: "1–2 hours",
      skills: ["Responsive Design", "Accessibility"],
    },
  ],

  communications: [
    {
      id: "host-message-layout",
      type: "message",
      category: "Host Message",
      title: "Dashboard layout clarification",
      body: "Please keep the most important work and communication information visible without requiring collaborators to search through multiple pages.",
      sender: "Fred Hobbs",
      time: "18 minutes ago",
      unread: true,
    },
    {
      id: "review-feedback-authentication",
      type: "feedback",
      category: "Review Feedback",
      title: "Authentication wording",
      body: "The registration explanation is clear. Add one sentence explaining that project roles are assigned after the account is created.",
      sender: "Fred Hobbs",
      time: "Yesterday",
      unread: true,
    },
    {
      id: "api-shape-blocker",
      type: "blocker",
      category: "Open Blocker",
      title: "Project membership API shape needed",
      body: "The collaborator page can use mock data now, but the final connection needs a documented project-membership response.",
      sender: "Maya Chen",
      time: "2 hours ago",
      unread: false,
    },
  ],
};
