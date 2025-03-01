import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api"; // Update if needed

// Get the JWT token from local storage
const getToken = () => localStorage.getItem("token");

export const createPitch = async (pitchData) => {
    return axios.post(`${API_BASE_URL}/pitches`, pitchData, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
};

export const getPitches = async () => {
    return axios.get(`${API_BASE_URL}/pitches`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
};
