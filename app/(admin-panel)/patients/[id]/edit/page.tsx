import PatientForm from "@/app/components/patients/patient-form";
import {
  getPatientDetails,
  getPatientSurvey,
} from "@/app/services/server_side/patients";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const response = await getPatientDetails(id);
  const patientDetail = response;
  const surveyResponse = await getPatientSurvey(id);
  return (
    <PatientForm
      action="Edit"
      patient={patientDetail}
      patientSurvey={surveyResponse}
    />
  );
}
