const mockSectionStatuses = [
  {
    id: "available",
    label: "Available",
    count: 2,
  },
  {
    id: "claimed",
    label: "Claimed",
    count: 1,
  },
  {
    id: "in-progress",
    label: "In Progress",
    count: 1,
  },
  {
    id: "completed",
    label: "Completed",
    count: 2,
  },
  {
    id: "blocked",
    label: "Blocked",
    count: 0,
  },
];

const sectionCount = mockSectionStatuses.reduce(
  (total, status) => total + status.count,
  0,
);

export const mockHostProject = {
  name: "SkillForge Collaboration Platform",

  repository: "FHobbs8030/skillforge",

  description:
    "A collaborative development workspace for organizing project sections, coordinating contributors, and monitoring GitHub activity.",

  goal: "Build a role-based platform where Hosts define project work and Collaborators claim available sections.",

  status: "Active",

  collaboratorCount: 4,

  sectionCount,

  updatedLabel: "Updated today",
};

export const mockHostSectionSummary = {
  statuses: mockSectionStatuses,

  updatedLabel: "Updated today",
};
