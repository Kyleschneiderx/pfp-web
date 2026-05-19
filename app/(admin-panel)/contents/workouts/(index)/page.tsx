import { fetchWorkouts } from "@/app/components/workouts/actions";
import WorkoutList from "@/app/components/workouts/workout-list";
import type { WorkoutModel } from "@/app/models/workout_model";

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

	let workouts: WorkoutModel[] = [];
	let maxPage = 0;

	try {
		const { workoutList, max_page } = await fetchWorkouts({
			name,
			sort,
			ownership,
		});
		workouts = workoutList;
		maxPage = max_page;
	} catch (error) {
		console.error(error);
	}

	return (
		<>
			<WorkoutList initialList={workouts} name={name} sort={sort} ownership={ownership} maxPage={maxPage} />
		</>
	);
}
