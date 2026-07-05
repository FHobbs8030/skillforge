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
      responseData?.error || `Request failed with status ${response.status}.`,
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
