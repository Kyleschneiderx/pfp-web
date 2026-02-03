import { PAGE_ITEMS } from "@/app/lib/constants";
import type { BladderDiaryEntryModel } from "@/app/models/bladder_diary_model";
import type { BowelDiaryEntryModel } from "@/app/models/bowel_diary_model";
import type { UserToolsModel } from "@/app/models/user_tools_model";
import { fetchPfPlanProgress } from "@/app/components/patients/actions";
import PatientForm from "@/app/components/patients/patient-form";
import type { PfPlanModel } from "@/app/models/pfplan_model";
import { getBladderDiaryList } from "@/app/services/server_side/bladder-diary";
import { getBowelDiaryList } from "@/app/services/server_side/bowel-diary";
import { getPatientDetails, getPersonalizedPfPlan } from "@/app/services/server_side/patients";
import { getUserTools } from "@/app/services/server_side/user-tools";

export default async function Page({ params }: { params: { id: string } }) {
	const id = params.id;
	const [patientDetail, pfPlanProgress, personalizedPfPlan, userTools, bladderDiaryResponse, bowelDiaryResponse] =
		await Promise.all([
			getPatientDetails(id),
			fetchPfPlanProgress(id),
			getPersonalizedPfPlan(id).catch(() => undefined as PfPlanModel | undefined),
			getUserTools(id),
			getBladderDiaryList(`user_id[]=${id}&page=1&page_items=${PAGE_ITEMS}`).catch(() => ({
				data: [] as BladderDiaryEntryModel[],
				page: 1,
				page_items: PAGE_ITEMS,
				max_page: 0,
			})),
			getBowelDiaryList(`user_id[]=${id}&page=1&page_items=${PAGE_ITEMS}`).catch(() => ({
				data: [] as BowelDiaryEntryModel[],
				page: 1,
				page_items: PAGE_ITEMS,
				max_page: 0,
			})),
		]);

	const userToolsOrDefault: UserToolsModel | null = userTools ?? {
		user_id: Number(id),
		bladder_diary_enabled: false,
		bowel_diary_enabled: false,
		created_at: "",
		updated_at: "",
	};

	return (
		<PatientForm
			action="Edit"
			patient={patientDetail}
			pfPlanProgress={pfPlanProgress}
			personalizedPfPlan={personalizedPfPlan}
			userTools={userToolsOrDefault}
			bladderDiaryEntries={bladderDiaryResponse.data}
			bowelDiaryEntries={bowelDiaryResponse.data}
		/>
	);
}
