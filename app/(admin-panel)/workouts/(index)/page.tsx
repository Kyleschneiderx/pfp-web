import Button from "@/app/components/elements/Button";
import SearchCmp from "@/app/components/elements/SearchCmp";
import { fetchWorkouts } from "@/app/components/workouts/actions";
import WorkoutList from "@/app/components/workouts/workout-list";
import WorkoutSort from "@/app/components/workouts/workout_sort";
import { WorkoutModel } from "@/app/models/workout_model";
import Link from "next/link";

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
  const sort = searchParams?.sort || "name:ASC";

  let workouts: WorkoutModel[] = [];
  let maxPage: number = 0;
  let errorMessage: string = "";

  const displayNoRecord = (msg: string) => {
    return <p className="text-center mx-auto mt-[300px]">{msg}</p>;
  };

  try {
    const { workoutList, max_page } = await fetchWorkouts({
      name,
      sort,
    });
    workouts = workoutList;
    maxPage = max_page;
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  return (
    <>
      <div className="flex items-center mb-8">
        <SearchCmp placeholder="Search workouts" />
        <WorkoutSort />
        <Link href="/workouts/create" className="ml-auto">
          <Button label="Add Workout" showIcon />
        </Link>
      </div>
      <div>
        {errorMessage ? (
          displayNoRecord(errorMessage)
        ) : (
          <WorkoutList
            initialList={workouts}
            name={name}
            sort={sort}
            maxPage={maxPage}
          />
        )}
      </div>
    </>
  );
}
