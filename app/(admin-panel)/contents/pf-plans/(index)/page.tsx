import { fetchPfPlans } from "@/app/components/pf-plans/action";
import PfPlanList from "@/app/components/pf-plans/pfplan-list";
import type { PfPlanModel } from "@/app/models/pfplan_model";

export default async function Page({
	searchParams,
}: {
	searchParams?: {
		page: string;
		name?: string;
		sort?: string;
		ownership?: string;
	};
}) {
	const name = searchParams?.name || "";
	const sort = searchParams?.sort || "name:ASC";
	const ownership = searchParams?.ownership || "";

	let pfPlans: PfPlanModel[] = [];
	let maxPage = 0;

	try {
		const { pfPlanList, max_page } = await fetchPfPlans({
			name,
			sort,
			ownership,
		});
		pfPlans = pfPlanList;
		maxPage = max_page;
	} catch (error) {
		console.error(error);
	}

	return (
		<>
			<PfPlanList initialList={pfPlans} name={name} sort={sort} ownership={ownership} maxPage={maxPage} />
		</>
	);
}
