import { apiClient } from "@/app/services/apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface FormPatientParams {
  id?: number;
  name: string;
  email: string;
  contactNo: string;
  birthdate: string;
  description: string | null;
  userType: number;
  photo: File | null;
}

export const createPatient = async ({
  name,
  email,
  contactNo,
  birthdate,
  description,
  userType,
  photo,
}: FormPatientParams): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/users`;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("contact_number", contactNo);
  formData.append("birthdate", birthdate);
  if (description) formData.append("description", description);
  formData.append("type_id", userType.toString());
  if (photo) formData.append("photo", photo);

  return apiClient<{ msg: string }>({
    url: url,
    method: "POST",
    body: formData,
    contentType: "multipart/form-data",
  });
};

export const updatePatient = async ({
  id,
  name,
  email,
  contactNo,
  birthdate,
  description,
  userType,
  photo,
}: FormPatientParams): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/users/${id}`;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("contact_number", contactNo);
  formData.append("birthdate", birthdate);
  if (description) formData.append("description", description);
  formData.append("type_id", userType.toString());
  if (photo) formData.append("photo", photo);

  return apiClient<{ msg: string }>({
    url: url,
    method: "PUT",
    body: formData,
    contentType: "multipart/form-data",
  });
};

export const deleteExercise = async (id: number): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/exercises/${id}`;
  return await apiClient<{ msg: string }>({ url: url, method: "DELETE" });
};
