import Button from "@/app/components/elements/Button";
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
  };
}) {
  const name = searchParams?.name || "";
  const sort = searchParams?.sort || "name:ASC";
  const category_id = searchParams?.category_id || "";

  let exercises: ExerciseModel[] = [];
  let maxPage: number = 0;
  let errorMessage: string = "";

  const displayNoRecord = (msg: string) => {
    return <p className="text-center mx-auto mt-[300px]">{msg}</p>;
  };

  try {
    const {exerciseList, max_page} = await fetchExercises({ name, sort, category_id });
    exercises = exerciseList;
    maxPage = max_page;
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  return (
    <>
      <div className="flex items-center mb-8">
        <SearchCmp placeholder="Search exercises" />
        <ExerciseFilterSort />
        <Link href="/exercises/create" className="ml-auto">
          <Button label="Add Exercise" showIcon />
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
            maxPage={maxPage}
          />
        )}
      </div>
    </>
  );
}
