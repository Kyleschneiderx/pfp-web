import { fetchPatients } from "@/app/components/patients/actions";
import PatientList from "@/app/components/patients/patient-list";
import type { PatientModel } from "@/app/models/patient_model";

export default async function Page({
	searchParams,
}: {
	searchParams?: {
		page: string;
		search?: string;
		sort?: string;
		status_id?: string;
	};
}) {
	const search = searchParams?.search || "";
	const sort = searchParams?.sort || "name:ASC";
	const status_id = searchParams?.status_id || "";

	let patients: PatientModel[] = [];
	let maxPage = 0;

	try {
		const { patientList, max_page } = await fetchPatients({
			search,
			sort,
			status_id,
		});
		patients = patientList;
		maxPage = max_page;
	} catch (error) {
		console.error(error);
	}

	return (
		<>
			<div>
				<PatientList initialList={patients} search={search} sort={sort} status_id={status_id} maxPage={maxPage} />
			</div>
		</>
	);
}
