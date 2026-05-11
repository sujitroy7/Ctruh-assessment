import { ApiResponse } from "@/types/api";
import api from ".";

type UploadImageResponse = ApiResponse<{ url: string }>;

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post<UploadImageResponse>("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const data = response.data;
  if (!data.success) throw new Error(data.message);
  return data.data.url;
};
