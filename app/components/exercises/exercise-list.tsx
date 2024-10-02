"use client";

import Badge from "@/app/components/elements/Badge";
import Card from "@/app/components/elements/Card";
import { ExerciseModel } from "@/app/models/exercise_model";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Loader from "../elements/Loader";
import { fetchExercises } from "./actions";
import ExerciseAction from "./exercise-action";

export default function ExerciseList({
  name,
  sort,
  category_id,
  initialList,
  maxPage,
  sets_from,
  sets_to,
  reps_from,
  reps_to,
}: {
  name: string;
  sort: string;
  category_id: string;
  sets_from: string;
  sets_to: string;
  reps_from: string;
  reps_to: string;
  initialList: ExerciseModel[] | [];
  maxPage: number;
}) {
  const [exercises, setExercises] = useState(initialList);
  const [page, setPage] = useState(1);
  const [ref, inView] = useInView();

  const loadMoreExercises = async () => {
    const next = page + 1;
    const { exerciseList } = await fetchExercises({
      page: next,
      name,
      sort,
      category_id,
      sets_from,
      sets_to,
      reps_from,
      reps_to,
    });
    if (exerciseList.length) {
      setPage(next);
      setExercises((prev: ExerciseModel[]) => [
        ...(prev?.length ? prev : []),
        ...exerciseList,
      ]);
    }
  };

  useEffect(() => {
    if (inView && page < maxPage) {
      loadMoreExercises();
    }
  }, [inView]);

  useEffect(() => {
    setExercises(initialList);
    setPage(1);
  }, [sort, name, category_id, initialList]);

  return (
    <>
      <div className="flex flex-wrap">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="w-[351px] mr-7 mb-7 text-neutral-900"
          >
            <div className="relative h-[200px]">
              <Image
                src={exercise.photo || "/images/exercise-banner.jpg"}
                alt="Exercise banner"
                fill
                sizes="350vw"
                className="rounded-lg rounded-b-none object-cover"
                priority
                quality={90}
                placeholder="blur"
                blurDataURL="/images/placeholder.jpg"
              />
              <Badge
                label={`${exercise.exercise_category.value}`}
                className="text-white !bg-primary-500 absolute top-4 left-5"
              />
            </div>
            <Card className="min-h-[158px] rounded-t-none py-4 px-5">
              <div className="flex">
                <Badge label={`${exercise.sets} sets`} />
                <Badge label={`${exercise.reps} reps`} />
                <ExerciseAction exercise={exercise} />
              </div>
              <p className="text-lg font-semibold leading-tight mt-[8px] mb-[6px]">
                {exercise.name}
              </p>
              <p className="text-sm text-neutral-700 mt-1">
                {exercise.description}
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
