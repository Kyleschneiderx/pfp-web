import CommonSort from "@/app/components/common-sort";
import Button from "@/app/components/elements/Button";
import IconAddButton from "@/app/components/elements/mobile/IconAddButton";
import SearchCmp from "@/app/components/elements/SearchCmp";
import { fetchWorkouts } from "@/app/components/workouts/actions";
import WorkoutList from "@/app/components/workouts/workout-list";
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
        <SearchCmp placeholder="Search workouts" className="mr-4 sm:mr-0" />
        <CommonSort field="name" />
        <Link href="/workouts/create" className="ml-auto">
          <Button label="Add Workout" showIcon className="hidden sm:flex" />
          <IconAddButton className="sm:hidden" />
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
