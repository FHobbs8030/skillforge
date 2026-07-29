export const SESSION_EXPIRED_EVENT =
  "skillforge:session-expired";

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

function getApiUrl(path) {
  if (!BASE_URL) {
    throw new Error(
      "VITE_API_URL is not configured. Add it to the frontend environment file.",
    );
  }

  return `${BASE_URL}${path}`;
}

async function checkResponse(
  response,
  {
    isAuthenticatedRequest = false,
  } = {},
) {
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
    if (
      response.status === 401 &&
      isAuthenticatedRequest &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(
        new CustomEvent(SESSION_EXPIRED_EVENT),
      );
    }

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
  const requestHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const authorizationHeader =
    requestHeaders.Authorization ||
    requestHeaders.authorization ||
    "";

  const isAuthenticatedRequest =
    typeof authorizationHeader === "string" &&
    /^Bearer\s+\S+/i.test(authorizationHeader);

  const response = await fetch(getApiUrl(path), {
    ...options,

    headers: requestHeaders,
  });

  return checkResponse(response, {
    isAuthenticatedRequest,
  });
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

export function startGitHubConnection(token) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  return apiRequest("/auth/github/connect", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function disconnectGitHubAccount(token) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  return apiRequest("/auth/github", {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
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

export function archiveProject({ token, projectId }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!projectId) {
    return Promise.reject(new Error("Project ID is required."));
  }

  return apiRequest(`/projects/${encodeURIComponent(projectId)}/archive`, {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${token}`,
    },
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

export function getOrganizations(token) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  return apiRequest("/organizations", {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getPendingOrganizationInvitations(token) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  return apiRequest("/organizations/invitations/pending", {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createOrganization({
  token,
  name,
  description = "",
  slug = "",
}) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedDescription =
    typeof description === "string" ? description.trim() : "";
  const normalizedSlug = typeof slug === "string" ? slug.trim() : "";

  if (!normalizedName) {
    return Promise.reject(new Error("Organization name is required."));
  }

  const requestBody = {
    name: normalizedName,
    description: normalizedDescription,
  };

  if (normalizedSlug) {
    requestBody.slug = normalizedSlug;
  }

  return apiRequest("/organizations", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(requestBody),
  });
}

export function getOrganizationById({ token, organizationId }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!organizationId) {
    return Promise.reject(new Error("Organization ID is required."));
  }

  return apiRequest(
    `/organizations/${encodeURIComponent(organizationId)}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function getOrganizationMembers({ token, organizationId }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!organizationId) {
    return Promise.reject(new Error("Organization ID is required."));
  }

  return apiRequest(
    `/organizations/${encodeURIComponent(organizationId)}/members`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function getOrganizationActivity({ token, organizationId }) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!organizationId) {
    return Promise.reject(new Error("Organization ID is required."));
  }

  return apiRequest(
    `/organizations/${encodeURIComponent(organizationId)}/activity`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function acceptOrganizationInvitation({
  token,
  organizationId,
}) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!organizationId) {
    return Promise.reject(new Error("Organization ID is required."));
  }

  return apiRequest(
    `/organizations/${encodeURIComponent(
      organizationId,
    )}/invitations/accept`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function declineOrganizationInvitation({
  token,
  organizationId,
}) {
  if (!token) {
    return Promise.reject(new Error("Authentication token is required."));
  }

  if (!organizationId) {
    return Promise.reject(new Error("Organization ID is required."));
  }

  return apiRequest(
    `/organizations/${encodeURIComponent(
      organizationId,
    )}/invitations/decline`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function updateOrganization({
  token,
  organizationId,
  name,
  slug,
  description = "",
}) {
  if (!token) {
    return Promise.reject(
      new Error("Authentication token is required."),
    );
  }

  if (!organizationId) {
    return Promise.reject(
      new Error("Organization ID is required."),
    );
  }

  const normalizedName =
    typeof name === "string" ? name.trim() : "";

  const normalizedSlug =
    typeof slug === "string"
      ? slug.trim().toLowerCase()
      : "";

  const normalizedDescription =
    typeof description === "string"
      ? description.trim()
      : "";

  return apiRequest(
    `/organizations/${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name: normalizedName,
        slug: normalizedSlug,
        description: normalizedDescription,
      }),
    },
  );
}

export function archiveOrganization({
  token,
  organizationId,
}) {
  if (!token) {
    return Promise.reject(
      new Error("Authentication token is required."),
    );
  }

  if (!organizationId) {
    return Promise.reject(
      new Error("Organization ID is required."),
    );
  }

  return apiRequest(
    `/organizations/${encodeURIComponent(organizationId)}/archive`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export function createOrganizationInvitation({
  token,
  organizationId,
  email,
  role = "member",
}) {
  if (!token) {
    return Promise.reject(
      new Error("Authentication token is required."),
    );
  }

  if (!organizationId) {
    return Promise.reject(
      new Error("Organization ID is required."),
    );
  }

  const normalizedEmail =
    typeof email === "string"
      ? email.trim().toLowerCase()
      : "";

  const normalizedRole =
    typeof role === "string"
      ? role.trim().toLowerCase()
      : "member";

  if (!normalizedEmail) {
    return Promise.reject(
      new Error("Email address is required."),
    );
  }

  return apiRequest(
    `/organizations/${encodeURIComponent(
      organizationId,
    )}/invitations`,
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
