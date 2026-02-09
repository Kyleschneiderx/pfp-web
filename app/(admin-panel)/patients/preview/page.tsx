import { fetchPatients } from "@/app/components/patients/actions";
import PatientListTable from "@/app/components/patients/patient-list-table";
import type { PatientModel } from "@/app/models/patient_model";

export default async function Page({
	searchParams,
}: {
	searchParams?: {
		page?: string;
		search?: string;
		sort?: string;
		status_id?: string;
	};
}) {
	const page = Math.max(1, Number.parseInt(searchParams?.page || "1", 10) || 1);
	const search = searchParams?.search || "";
	const sort = searchParams?.sort || "id:DESC";
	const status_id = searchParams?.status_id || "";

	let patients: PatientModel[] = [];
	let maxPage = 0;

	try {
		const { patientList, max_page } = await fetchPatients({
			page,
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
		<div>
			<PatientListTable
				initialList={patients}
				initialPage={page}
				maxPage={maxPage}
				search={search}
				sort={sort}
				status_id={status_id}
			/>
		</div>
	);
}
