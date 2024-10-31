"use client";

import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { CONFIRM_DELETE_DESCRIPTION } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { ErrorModel } from "@/app/models/error_model";
import { WorkoutModel } from "@/app/models/workout_model";
import {
  deleteWorkout,
  saveWorkout,
} from "@/app/services/client_side/workouts";
import { useActionMenuStore } from "@/app/store/store";
import { EllipsisVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CardBanner from "../elements/CardBanner";
import ConfirmModal from "../elements/ConfirmModal";
import Loader from "../elements/Loader";
import ActionMenuMobile from "../elements/mobile/ActionMenuMobile";
import ModalRename from "../elements/ModalRename";
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
  const { workout, setWorkout, setEditUrl, setIsOpen } = useActionMenuStore();

  const [workouts, setWorkouts] = useState(initialList);
  const [page, setPage] = useState(1);
  const [ref, inView] = useInView();

  const { showSnackBar } = useSnackBar();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRenameOpen, setModalRenameOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalOpen(false);
      setModalRenameOpen(false);
    }
  };

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

  const handleActionMenuClick = (workout: WorkoutModel) => {
    setIsOpen(true);
    setWorkout(workout);
    setEditUrl(`workouts/${workout.id}/edit`);
  };

  const handleConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        await deleteWorkout(workout!.id);
        await revalidatePage("/workouts");
        setIsProcessing(false);
        showSnackBar({
          message: `Workout successfully deleted.`,
          success: true,
        });
        setModalOpen(false);
        setIsOpen(false);
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
        setModalOpen(false);
        setIsOpen(false);
      }
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        const body = new FormData();
        body.append("name", newName);
        await saveWorkout({ method: "PUT", id: workout!.id, body });
        await revalidatePage("/workouts");
        setIsProcessing(false);
        showSnackBar({
          message: `Workout successfully renamed.`,
          success: true,
        });
        setModalRenameOpen(false);
        setIsOpen(false);
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
        setModalRenameOpen(false);
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      <div className="flex flex-wrap">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="w-[351px] mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900"
          >
            <CardBanner url={workout.photo} />
            <Card className="min-h-[158px] rounded-t-none py-4 px-5">
              <div className="flex">
                <StatusBadge label={workout.status.value} />
                {/* For desktop */}
                <WorkoutAction workout={workout} />
                {/* For mobile */}
                <EllipsisVertical
                  size={21}
                  className="text-neutral-900 cursor-pointer sm:hidden"
                  onClick={() => handleActionMenuClick(workout)}
                />
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
        {/* For mobile */}
        <ActionMenuMobile
          onDeleteClick={handleOpenModal}
          onRenameClick={() => setModalRenameOpen(true)}
        />
        <ConfirmModal
          title="Are you sure you want to delete this workout?"
          subTitle={CONFIRM_DELETE_DESCRIPTION}
          isOpen={modalOpen}
          confirmBtnLabel="Delete"
          isProcessing={isProcessing}
          onConfirm={handleConfirm}
          onClose={handleCloseModal}
        />
        <ModalRename
          isOpen={modalRenameOpen}
          onClose={handleCloseModal}
          name={workout?.name || ""}
          onSaveClick={handleRenameConfirm}
          isProcessing={isProcessing}
          label="Workout"
        />
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
