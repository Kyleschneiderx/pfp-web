import PfPlanForm from "@/app/components/pf-plans/pfplan-form";
import type { PfPlanModel } from "@/app/models/pfplan_model";
import { getPatientDetails } from "@/app/services/server_side/patients";
import { getPfPlanDetails } from "@/app/services/server_side/pfplans";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string; pfPlanId?: string[] } }) {
	const id = params.id;
	const patientDetail = await getPatientDetails(id);
	let pfPlan: PfPlanModel | undefined = undefined;
	if (params?.pfPlanId?.[0]) {
		try {
			pfPlan = await getPfPlanDetails(params.pfPlanId[0], { with_archive: true });
		} catch (error) {
			console.error(error);
			notFound();
		}
	}

	return <PfPlanForm action={pfPlan ? "Edit" : "Create"} patient={patientDetail} pfPlan={pfPlan} />;
}
