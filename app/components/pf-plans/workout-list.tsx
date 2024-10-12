import { ErrorModel } from "@/app/models/error_model";
import { WorkoutModel } from "@/app/models/workout_model";
import { getWorkouts } from "@/app/services/client_side/workouts";
import clsx from "clsx";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Loader from "../elements/Loader";

interface Props {
  name?: string;
  onSelect: (workout: WorkoutModel) => void;
}

export default function WorkoutList({ name = "", onSelect }: Props) {
  const [workoutList, setWorkoutList] = useState<WorkoutModel[]>([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [ref, inView] = useInView();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchWorkouts = async (resetPage = false) => {
    try {
      setIsLoading(true);
      const currentPage = resetPage ? 1 : page;
      const params = `name=${name}&sort[]=name:ASC&page=${currentPage}&page_items=20`;
      const { data, max_page } = await getWorkouts(params);
      setMaxPage(max_page);
      if (currentPage < max_page) {
        setPage(currentPage + 1);
      }
      setWorkoutList((prev: WorkoutModel[]) => {
        return resetPage ? data : [...prev, ...data];
      });
      setErrorMessage("");
    } catch (error) {
      const apiError = error as ErrorModel;
      setErrorMessage(apiError.msg || "Failed to fetch workouts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchWorkouts(true);
  }, [name]);

  useEffect(() => {
    if (inView && page <= maxPage && !isLoading) {
      fetchWorkouts();
    }
  }, [inView, page]);

  const truncatedText = (text: string, max: number) => {
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const pClass =
    "truncate max-w-xs overflow-hidden text-ellipsis whitespace-nowrap";

  return (
    <div className="space-y-3 mt-2">
      {errorMessage ? (
        <p className="text-center mt-[200px]">{errorMessage}</p>
      ) : (
        workoutList.map((item) => (
          <div key={item.id} className="flex items-center">
            <div className="flex items-center shadow-bottom w-full p-2">
              <Image
                src={item.photo || "/images/exercise-banner.jpg"}
                width={80}
                height={56}
                alt="Banner"
                placeholder="blur"
                blurDataURL="/images/placeholder.jpg"
                className="w-[80px] h-[56px]"
              />
              <div className="ml-3">
                <p
                  className={clsx(
                    pClass,
                    "text-sm font-medium text-neutral-800 mb-1"
                  )}
                >
                  {truncatedText(item.name, 35)}
                </p>
                <p className={clsx(pClass, "text-xs text-neutral-500")}>
                  {truncatedText(item.description ?? "", 45)}
                </p>
              </div>
              <Plus
                className="ml-auto cursor-pointer"
                onClick={() => onSelect(item)}
              />
            </div>
          </div>
        ))
      )}
      {page < maxPage && (
        <div ref={ref} className="flex justify-center mt-5">
          <Loader />
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
}
