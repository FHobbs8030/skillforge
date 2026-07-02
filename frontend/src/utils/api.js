const BASE_URL = import.meta.env.VITE_API_URL;

function checkResponse(response) {
  if (!response.ok) {
    return response.text().then((text) => {
      console.error("SERVER ERROR:", text);

      throw new Error(`Request failed with status ${response.status}`);
    });
  }

  return response.json();
}

export function getGitHubUser(username) {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    return Promise.reject(new Error("A GitHub username is required."));
  }

  return fetch(
    `${BASE_URL}/github/${encodeURIComponent(normalizedUsername)}`,
  ).then(checkResponse);
}
