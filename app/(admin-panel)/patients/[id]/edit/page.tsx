import PatientForm from "@/app/components/patients/patient-form";
import { samplePatients } from "@/app/lib/sample-data";

export default function Page() {
  // get the patient data here

  return (
    <PatientForm action="Edit" patient={samplePatients[0]} />
  );
}
