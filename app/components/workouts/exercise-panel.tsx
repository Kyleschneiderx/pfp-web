"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { ErrorModel } from "@/app/models/error_model";
import { ExerciseModel } from "@/app/models/exercise_model";
import { getExercises } from "@/app/services/client_side/exercises";
import clsx from "clsx";
import { Check, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Loader from "../elements/Loader";
import SearchCmp from "../elements/SearchCmp";
import SidePanel from "../elements/SidePanel";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseModel) => void;
}

export default function ExercisePanel({
  isOpen = false,
  onClose,
  onSelect,
}: Props) {
  const { showSnackBar } = useSnackBar();
  const [exercises, setExercises] = useState<ExerciseModel[]>([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [name, setName] = useState("");
  const [ref, inView] = useInView();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

  const fetchExercises = async (resetPage = false) => {
    try {
      setIsLoading(true);
      const currentPage = resetPage ? 1 : page;
      const params = `name=${name}&sort[]=name:ASC&page=${currentPage}&page_items=20`;
      const { data, max_page } = await getExercises(params);
      setMaxPage(max_page);
      if (currentPage < max_page) {
        setPage(currentPage + 1);
      }
      setExercises((prev: ExerciseModel[]) => {
        return resetPage ? data : [...prev, ...data];
      });
      setErrorMessage("");
    } catch (error) {
      const apiError = error as ErrorModel;
      setErrorMessage(apiError.msg || "Failed to fetch exercises");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchExercises(true);
  }, [name]);

  useEffect(() => {
    if (inView && page <= maxPage && !isLoading) {
      fetchExercises();
    }
  }, [inView, page]);

  const handleSelect = (item: ExerciseModel, index: number) => {
    onSelect(item);
    showSnackBar({ message: "Exercise was added to workout", success: true });
    setActiveIndexes((prev) => [...prev, index]);
    // Remove the index after 2 seconds to revert to the `+` icon
    setTimeout(() => {
      setActiveIndexes((prev) => prev.filter((i) => i !== index));
    }, 2000);
  };

  const pClass =
    "truncate max-w-xs overflow-hidden text-ellipsis whitespace-nowrap";

  return (
    <SidePanel isOpen={isOpen} onClose={onClose}>
      <p className="text-xl font-semibold">Add Exercise</p>
      <SearchCmp
        placeholder="Search exercise"
        className="!w-full mt-2"
        onChange={setName}
      />
      <div className="space-y-3 mt-2">
        {errorMessage ? (
          <p className="text-center mt-[200px]">{errorMessage}</p>
        ) : (
          exercises.map((item, index) => (
            <div key={item.id} className="flex items-center">
              <div className="flex items-center shadow-bottom w-[420px] p-2">
                <Image
                  src={item.photo || "/images/exercise-banner.jpg"}
                  width={80}
                  height={56}
                  alt="Banner"
                  placeholder="blur"
                  blurDataURL="/images/placeholder.jpg"
                  className="w-[80px] h-[56px]"
                />
                <div className="ml-3 w-[210px] sm:w-[270px]">
                  <p
                    className={clsx(
                      pClass,
                      "text-sm font-medium text-neutral-800 mb-1"
                    )}
                  >
                    {item.name}
                  </p>
                  <p className={clsx(pClass, "text-xs text-neutral-500")}>
                    {item.description}
                  </p>
                </div>
                {activeIndexes.includes(index) ? (
                  <Check className="ml-auto animate-pulse" />
                ) : (
                  <Plus
                    className="ml-auto cursor-pointer"
                    onClick={() => handleSelect(item, index)}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {page < maxPage && (
        <div ref={ref} className="flex justify-center mt-5">
          <Loader />
          <span>Loading...</span>
        </div>
      )}
    </SidePanel>
  );
}
