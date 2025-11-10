import { fetchEducations } from "@/app/components/education/actions";
import EducationList from "@/app/components/education/education-list";
import type { EducationModel } from "@/app/models/education_model";

export default async function Page({
	searchParams,
}: {
	searchParams?: {
		page: string;
		name?: string;
		sort?: string;
	};
}) {
	const name = searchParams?.name || "";
	const sort = searchParams?.sort || "title:ASC";

	let educations: EducationModel[] = [];
	let maxPage = 0;

	try {
		const { educationList, max_page } = await fetchEducations({
			name,
			sort,
		});
		educations = educationList;
		maxPage = max_page;
	} catch (error) {
		console.error(error);
	}

	return (
		<>
			<EducationList initialList={educations} name={name} sort={sort} maxPage={maxPage} />
		</>
	);
}
