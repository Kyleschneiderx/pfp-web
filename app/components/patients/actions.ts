"use server";

import { ErrorModel } from "@/app/models/error_model";
import { PatientModel } from "@/app/models/patient_model";
import { getPatients } from "@/app/services/server_side/patients";

export async function fetchPatients({
  page = 1,
  name,
  sort,
  status_id,
}: {
  page?: number;
  name: string;
  sort: string;
  status_id: string;
}): Promise<{patientList: PatientModel[]; max_page: number}> {

  let response;
  const params = `&name=${name}${
    !["0", ""].includes(status_id ?? "") ? `&status_id[]=${status_id}` : ""
  }&sort[]=${sort}&page=${page}&page_items=15`;

  try {
    response = await getPatients(params);
    console.log(response.data.length);
    return {patientList: response.data, max_page: response.max_page };
  } catch (error) {
    const apiError = error as ErrorModel;
    const errorMessage = apiError.msg || "Failed to fetch patients";
    throw new Error(errorMessage);
  }
}
