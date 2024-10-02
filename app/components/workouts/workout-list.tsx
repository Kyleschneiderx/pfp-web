"use client";

import Card from "@/app/components/elements/Card";
import { WorkoutModel } from "@/app/models/workout_model";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Loader from "../elements/Loader";
import StatusBadge from "../elements/StatusBadge";
import { fetchWorkouts } from "./actions";
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
                quality={90}
                placeholder="blur"
                blurDataURL="/images/placeholder.jpg"
              />
            </div>
            <Card className="min-h-[158px] rounded-t-none py-4 px-5">
              <div className="flex">
                <StatusBadge label={workout.status.value} />
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
        <div ref={ref} className="flex justify-center mt-5">
          <Loader />
          <span>Loading...</span>
        </div>
      )}
    </>
  );
}
