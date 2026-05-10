import api from ".";
import { Role } from "@/types/auth";
import { ApiResponse } from "@/types/api";
import axios from "axios";

interface RefreshAccessTokenResponse {
  access_token: string;
  refresh_token: string;
}
export const refreshAccessToken = async (refreshToken: string) => {
  const response = await api.post<ApiResponse<RefreshAccessTokenResponse>>(
    "/auth/refresh",
    null,
    {
      headers: { "x-refresh-token": refreshToken },
    },
  );

  if (!response.data.success)
    throw new Error(response.data.message || "Failed to refresh token");
  return response.data.data;
};

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
export const login = async (
  email: string,
  password: string,
  role: Role = "customer",
) => {
  const response = await axios.post<ApiResponse<LoginResponse>>(
    `${process.env.BACKEND_URL}/auth/login`,
    {
      email,
      password,
      role,
    },
  );
  const responseData = response.data;

  if (!responseData.success) {
    throw new Error(responseData.message || "Failed to login");
  }

  const data = responseData.data;
  return {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessTokenExpires: Date.now() + data.expires_in * 1000,
  };
};

export const logout = async () => {
  await api.post("/auth/logout");
};
