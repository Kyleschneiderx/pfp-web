import Button from "@/app/components/elements/Button";
import IconAddButton from "@/app/components/elements/mobile/IconAddButton";
import SearchCmp from "@/app/components/elements/SearchCmp";
import { fetchExercises } from "@/app/components/exercises/actions";
import ExerciseFilterSort from "@/app/components/exercises/exercise-filter-sort";
import ExerciseList from "@/app/components/exercises/exercise-list";
import { ExerciseModel } from "@/app/models/exercise_model";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page: string;
    name?: string;
    sort?: string;
    category_id?: string;
    sets_from?: string;
    sets_to?: string;
    reps_from?: string;
    reps_to?: string;
  };
}) {
  const name = searchParams?.name || "";
  const sort = searchParams?.sort || "name:ASC";
  const category_id = searchParams?.category_id || "";
  const sets_from = searchParams?.sets_from || "";
  const sets_to = searchParams?.sets_to || "";
  const reps_from = searchParams?.reps_from || "";
  const reps_to = searchParams?.reps_to || "";

  let exercises: ExerciseModel[] = [];
  let maxPage: number = 0;
  let errorMessage: string = "";

  const displayNoRecord = (msg: string) => {
    return <p className="text-center mx-auto mt-[300px]">{msg}</p>;
  };

  try {
    const { exerciseList, max_page } = await fetchExercises({
      name,
      sort,
      category_id,
      sets_from,
      sets_to,
      reps_from,
      reps_to,
    });
    exercises = exerciseList;
    maxPage = max_page;
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  return (
    <>
      <div className="flex items-center mb-8">
        <SearchCmp placeholder="Search exercises" className="mr-4 sm:mr-0" />
        <ExerciseFilterSort />
        <Link href="/exercises/create" className="ml-auto">
          <Button label="Add Exercise" showIcon className="hidden sm:flex" />
          <IconAddButton className="sm:hidden" />
        </Link>
      </div>
      <div>
        {errorMessage ? (
          displayNoRecord(errorMessage)
        ) : (
          <ExerciseList
            initialList={exercises}
            name={name}
            sort={sort}
            category_id={category_id}
            sets_from={sets_from}
            sets_to={sets_to}
            reps_from={reps_from}
            reps_to={reps_to}
            maxPage={maxPage}
          />
        )}
      </div>
    </>
  );
}
