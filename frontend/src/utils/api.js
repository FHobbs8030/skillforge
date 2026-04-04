const BASE_URL = import.meta.env.VITE_API_URL;

function _checkResponse(res) {
  if (!res.ok) {
    return Promise.reject(`Error: ${res.status}`);
  }
  return res.json();
}

export function getEntries() {
  return fetch(`${BASE_URL}/entries`).then(_checkResponse);
}

export function addEntry(data) {
  return fetch(`${BASE_URL}/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(_checkResponse);
}

export function getGitHubUser(username) {
  return fetch(`${BASE_URL}/github/${username}`).then(_checkResponse);
}
