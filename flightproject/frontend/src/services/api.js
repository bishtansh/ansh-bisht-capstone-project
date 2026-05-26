import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const predictDelay = async (data) => {
    const response = await fetch("http://127.0.0.1:8000/api/predict/", {
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
  