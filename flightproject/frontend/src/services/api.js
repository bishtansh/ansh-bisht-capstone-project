import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const predictDelay = async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/predict/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  
    if (!response.ok) {
      throw new Error("API Error");
    }
  
    return response.json();
  };

  