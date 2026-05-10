import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  adapter: "fetch",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export default axiosInstance;
