import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  withCredentials: true,
  adapter: "fetch",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export default api;
