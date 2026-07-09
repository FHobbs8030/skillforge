const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

function getApiUrl(path) {
  if (!BASE_URL) {
    throw new Error(
      "VITE_API_URL is not configured. Add it to the frontend environment file.",
    );
  }

  return `${BASE_URL}${path}`;
}

async function checkResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  let responseData = null;

  if (response.status !== 204) {
    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      const responseText = await response.text();

      responseData = responseText
        ? {
            error: responseText,
          }
        : null;
    }
  }

  if (!response.ok) {
    const requestError = new Error(
      responseData?.error ||
        responseData?.message ||
        `Request failed with status ${response.status}.`,
    );

    requestError.status = response.status;
    requestError.fields = responseData?.fields || {};

    throw requestError;
  }

  return responseData;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(getApiUrl(path), {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return checkResponse(response);
}

export function signUpUser({ fullName, email, password, membership }) {
  return apiRequest("/auth/signup", {
    method: "POST",

    body: JSON.stringify({
      fullName,
      email,
      password,
      membership,
    }),
  });
}

export function signInUser({ email, password }) {
  return apiRequest("/auth/signin", {
    method: "POST",

    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export function getCurrentUser(token) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  return apiRequest("/auth/me", {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateProfile({ token, fullName, email }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  return apiRequest("/auth/me", {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      fullName,
      email,
    }),
  });
}

export function getGitHubUser(username) {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    return Promise.reject(new Error("A GitHub username is required."));
  }

  return apiRequest(`/github/${encodeURIComponent(normalizedUsername)}`, {
    method: "GET",
  });
}

export function getProjects(token) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  return apiRequest("/projects", {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createProject({
  token,
  name,
  description = "",
  status = "active",
  visibility = "private",
}) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedDescription =
    typeof description === "string" ? description.trim() : "";
  const normalizedStatus =
    typeof status === "string" ? status.trim().toLowerCase() : "active";
  const normalizedVisibility =
    typeof visibility === "string"
      ? visibility.trim().toLowerCase()
      : "private";

  if (!normalizedName) {
    return Promise.reject(new Error("Project name is required."));
  }

  return apiRequest("/projects", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      name: normalizedName,
      description: normalizedDescription,
      status: normalizedStatus,
      visibility: normalizedVisibility,
    }),
  });
}

export function getPendingProjectInvitations(token) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  return apiRequest("/projects/invitations/pending", {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function acceptProjectInvitation({ token, projectId }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!projectId) {
    return Promise.reject(new Error("Project ID is required."));
  }

  return apiRequest(
    `/projects/${encodeURIComponent(projectId)}/invitations/accept`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function declineProjectInvitation({ token, projectId }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!projectId) {
    return Promise.reject(new Error("Project ID is required."));
  }

  return apiRequest(
    `/projects/${encodeURIComponent(projectId)}/invitations/decline`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function getProjectById({ token, projectId }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!projectId) {
    return Promise.reject(new Error("Project ID is required."));
  }

  return apiRequest(`/projects/${encodeURIComponent(projectId)}`, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateProject({
  token,
  projectId,
  name,
  description = "",
  status = "active",
  visibility = "private",
}) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!projectId) {
    return Promise.reject(new Error("Project ID is required."));
  }

  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedDescription =
    typeof description === "string" ? description.trim() : "";
  const normalizedStatus =
    typeof status === "string" ? status.trim().toLowerCase() : "active";
  const normalizedVisibility =
    typeof visibility === "string"
      ? visibility.trim().toLowerCase()
      : "private";

  if (!normalizedName) {
    return Promise.reject(new Error("Project name is required."));
  }

  return apiRequest(`/projects/${encodeURIComponent(projectId)}`, {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      name: normalizedName,
      description: normalizedDescription,
      status: normalizedStatus,
      visibility: normalizedVisibility,
    }),
  });
}

export function getProjectActivity({ token, projectId }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!projectId) {
    return Promise.reject(new Error("Project ID is required."));
  }

  return apiRequest(`/projects/${encodeURIComponent(projectId)}/activity`, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getProjectMembers({ token, projectId }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!projectId) {
    return Promise.reject(new Error("Project ID is required."));
  }

  return apiRequest(`/projects/${encodeURIComponent(projectId)}/members`, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function inviteProjectMember({ token, projectId, email, role }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!projectId) {
    return Promise.reject(new Error("Project ID is required."));
  }

  const normalizedEmail = typeof email === "string" ? email.trim() : "";
  const normalizedRole =
    typeof role === "string" ? role.trim().toLowerCase() : "collaborator";

  if (!normalizedEmail) {
    return Promise.reject(new Error("Member email is required."));
  }

  return apiRequest(
    `/projects/${encodeURIComponent(projectId)}/members/invite`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        email: normalizedEmail,
        role: normalizedRole,
      }),
    },
  );
}

export function connectProjectRepository({ token, projectId, repositoryUrl }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!projectId) {
    return Promise.reject(new Error("Project ID is required."));
  }

  const normalizedRepositoryUrl =
    typeof repositoryUrl === "string" ? repositoryUrl.trim() : "";

  if (!normalizedRepositoryUrl) {
    return Promise.reject(new Error("Repository URL is required."));
  }

  return apiRequest(`/projects/${encodeURIComponent(projectId)}/repository`, {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      repositoryUrl: normalizedRepositoryUrl,
    }),
  });
}
