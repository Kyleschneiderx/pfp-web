import { fetchPfPlanProgress } from "@/app/components/patients/actions";
import PatientForm from "@/app/components/patients/patient-form";
import type { PfPlanModel } from "@/app/models/pfplan_model";
import { getPatientDetails, getPersonalizedPfPlan } from "@/app/services/server_side/patients";

export default async function Page({ params }: { params: { id: string } }) {
	const id = params.id;
	const response = await getPatientDetails(id);
	const patientDetail = response;
	const pfPlanProgress = await fetchPfPlanProgress(id);
	let personalizedPfPlan: PfPlanModel | undefined = undefined;
	try {
		personalizedPfPlan = await getPersonalizedPfPlan(id);
	} catch (error) {
		console.error(error);
	}

	return (
		<PatientForm
			action="Edit"
			patient={patientDetail}
			pfPlanProgress={pfPlanProgress}
			personalizedPfPlan={personalizedPfPlan}
		/>
	);
}
