import { apiClient } from "./apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// export const getPatients = async () => {
//   const url = `${API_BASE_URL}/users`;
//   const data = await apiClient(url, "GET");
//   return data;
// };

interface CreatePatientParams {
  name: string;
  email: string;
  contactNo: string | null;
  birthdate: string | null;
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
}: CreatePatientParams): Promise<{ msg: string }> => {
  const url = `${API_BASE_URL}/users`;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  if (contactNo) formData.append("contact_number", contactNo);
  if (birthdate) formData.append("birthdate", birthdate);
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
