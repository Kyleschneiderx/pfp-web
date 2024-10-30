"use client";

import Badge from "@/app/components/elements/Badge";
import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { CONFIRM_DELETE_DESCRIPTION } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { ErrorModel } from "@/app/models/error_model";
import { ExerciseModel } from "@/app/models/exercise_model";
import {
  deleteExercise,
  saveExercise,
} from "@/app/services/client_side/exercises";
import { useActionMenuStore } from "@/app/store/store";
import { EllipsisVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import CardBanner from "../elements/CardBanner";
import ConfirmModal from "../elements/ConfirmModal";
import Loader from "../elements/Loader";
import ActionMenuMobile from "../elements/mobile/ActionMenuMobile";
import ModalRename from "../elements/ModalRename";
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
  const { exercise, setExercise, setEditUrl, setIsOpen } = useActionMenuStore();

  const [exercises, setExercises] = useState(initialList);
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

  const handleActionMenuClick = (exercise: ExerciseModel) => {
    setIsOpen(true);
    setExercise(exercise);
    setEditUrl(`exercises/${exercise.id}/edit`);
  };

  const handleConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        await deleteExercise(exercise!.id);
        await revalidatePage("/exercises");
        setIsProcessing(false);
        showSnackBar({
          message: `Exercise successfully deleted.`,
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
        await saveExercise({ method: "PUT", id: exercise!.id, body });
        await revalidatePage("/exercises");
        setIsProcessing(false);
        showSnackBar({
          message: `Exercise successfully renamed.`,
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
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="w-[351px] mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900"
          >
            <div className="relative h-[200px]">
              <CardBanner url={exercise.photo} />
              <Badge
                label={`${exercise.exercise_category.value}`}
                className="text-white !bg-primary-500 absolute top-4 left-5"
              />
            </div>
            <Card className="min-h-[158px] rounded-t-none py-4 px-5">
              <div className="flex">
                <Badge label={`${exercise.sets} sets`} />
                <Badge label={`${exercise.reps} reps`} />
                {/* For desktop */}
                <ExerciseAction exercise={exercise} />
                {/* For mobile */}
                <EllipsisVertical
                  size={21}
                  className="text-neutral-900 cursor-pointer sm:hidden"
                  onClick={() => handleActionMenuClick(exercise)}
                />
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
        {/* For mobile */}
        <ActionMenuMobile
          onDeleteClick={handleOpenModal}
          onRenameClick={() => setModalRenameOpen(true)}
        />
        <ConfirmModal
          title="Are you sure you want to delete this exercise?"
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
          name={exercise?.name || ""}
          onSaveClick={handleRenameConfirm}
          isProcessing={isProcessing}
          label="Exercise"
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
