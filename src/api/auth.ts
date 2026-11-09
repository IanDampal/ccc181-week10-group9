const API_URL = import.meta.env.VITE_API_URL;

// Function 1: Sends the login request to the backend
export async function loginApi(email: string, password: string) {
  const response = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // If server responds with 400 or 401, throw the server's error message
    throw new Error(data.error || 'Invalid email or password.');
  }
  
  return data; // Returns token and user object
}

// Function 2: Verifies an existing token when the page refreshes
export async function getMeApi(token: string) {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Not logged in.');
  }
  
  return data; // Returns user profile
}