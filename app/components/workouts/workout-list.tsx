"use client";

import Badge from "@/app/components/elements/Badge";
import Card from "@/app/components/elements/Card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { fetchWorkouts } from "./actions";
// import ExerciseAction from "./exercise-action";
import { WorkoutModel } from "@/app/models/workout_model";
import clsx from "clsx";
import WorkoutAction from "./workout-action";

interface Props {
  name: string;
  sort: string;
  initialList: WorkoutModel[] | [];
  maxPage: number;
}

export default function WorkoutList({
  name,
  sort,
  initialList,
  maxPage,
}: Props) {
  const [workouts, setWorkouts] = useState(initialList);
  const [page, setPage] = useState(1);
  const [ref, inView] = useInView();

  const loadMoreWorkouts = async () => {
    const next = page + 1;
    const { workoutList } = await fetchWorkouts({
      page: next,
      name,
      sort,
    });
    if (workoutList.length) {
      setPage(next);
      setWorkouts((prev: WorkoutModel[]) => [
        ...(prev?.length ? prev : []),
        ...workoutList,
      ]);
    }
  };

  useEffect(() => {
    if (inView && page < maxPage) {
      loadMoreWorkouts();
    }
  }, [inView]);

  useEffect(() => {
    setWorkouts(initialList);
    setPage(1);
  }, [sort, name, initialList]);

  return (
    <>
      <div className="flex flex-wrap">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="w-[351px] mr-7 mb-7 text-neutral-900"
          >
            <div className="relative h-[200px]">
              <Image
                src={workout.photo || "/images/exercise-banner.jpg"}
                alt="Exercise banner"
                fill
                sizes="350vw"
                className="rounded-lg rounded-b-none object-cover"
                priority
              />
            </div>
            <Card className="min-h-[158px] rounded-t-none py-4 px-5">
              <div className="flex">
                <Badge
                  label={workout.status.value}
                  className={clsx(
                    "!rounded-md",
                    workout.status.value === "Published"
                      ? "text-success-600 bg-secondary-100"
                      : "text-neutral-400 bg-slate-100"
                  )}
                />
                <WorkoutAction workout={workout} />
              </div>
              <p className="text-lg font-semibold leading-tight mt-[8px] mb-[6px]">
                {workout.name}
              </p>
              <p className="text-sm text-neutral-700 mt-1">
                {workout.description}
              </p>
            </Card>
          </div>
        ))}
      </div>
      {page < maxPage && (
        <div ref={ref} className="flex justify-center mt -8">
          <svg
            className="animate-spin h-5 w-5 text-primary-500 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <span>Loading...</span>
        </div>
      )}
    </>
  );
}
