const BASE_URL = import.meta.env.VITE_API_URL;

console.log("BASE_URL:", BASE_URL);

function _checkResponse(res) {
  if (!res.ok) {
    return res.text().then((text) => {
      console.error("SERVER ERROR:", text);
      return Promise.reject(`Error: ${res.status}`);
    });
  }
  return res.json();
}
 
export function getEntries() {
  console.log("GET ENTRIES:", BASE_URL);
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
  console.log("GITHUB FETCH:", `${BASE_URL}/github/${username}`);
  return fetch(`${BASE_URL}/github/${username}`).then(_checkResponse);
}
