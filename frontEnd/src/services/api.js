import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; // Laravel Backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Set JWT Token for authentication
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token); // Store token locally
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// Automatically set token if available on page load
const token = localStorage.getItem("token");
if (token) {
  setAuthToken(token);
}

// API Endpoints
export const getPitches = () => api.get("/pitches");
export const createPitch = (pitchData) => api.post("/pitches", pitchData);
export const deletePitch = (id) => api.delete(`/pitches/${id}`);

export default api;
