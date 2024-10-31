"use client";

import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { CONFIRM_DELETE_DESCRIPTION } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { EducationModel } from "@/app/models/education_model";
import { ErrorModel } from "@/app/models/error_model";
import {
  deleteEducation,
  saveEducation,
} from "@/app/services/client_side/educations";
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
import { fetchEducations } from "./actions";
import EducationAction from "./education-action";

interface Props {
  name: string;
  sort: string;
  initialList: EducationModel[] | [];
  maxPage: number;
}

export default function EducationList({
  name,
  sort,
  initialList,
  maxPage,
}: Props) {
  const { education, setEducation, setEditUrl, setIsOpen } =
    useActionMenuStore();

  const [educations, setEducations] = useState(initialList);
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

  const loadMoreEducations = async () => {
    const next = page + 1;
    const { educationList } = await fetchEducations({
      page: next,
      name,
      sort,
    });
    if (educationList.length) {
      setPage(next);
      setEducations((prev: EducationModel[]) => [
        ...(prev?.length ? prev : []),
        ...educationList,
      ]);
    }
  };

  useEffect(() => {
    if (inView && page < maxPage) {
      loadMoreEducations();
    }
  }, [inView]);

  useEffect(() => {
    setEducations(initialList);
    setPage(1);
  }, [sort, name, initialList]);

  const handleActionMenuClick = (education: EducationModel) => {
    setIsOpen(true);
    setEducation(education);
    setEditUrl(`education/${education.id}/edit`);
  };

  const handleConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        await deleteEducation(education!.id);
        await revalidatePage("/education");
        setIsProcessing(false);
        showSnackBar({
          message: `Education successfully deleted.`,
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

  const handleRenameConfirm = async (newTitle: string) => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        const body = new FormData();
        body.append("title", newTitle);
        await saveEducation({ method: "PUT", id: education!.id, body });
        await revalidatePage("/education");
        setIsProcessing(false);
        showSnackBar({
          message: `Education successfully renamed.`,
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
        {educations.map((education) => (
          <div
            key={education.id}
            className="w-[351px] mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900"
          >
            <CardBanner url={education.photo} />
            <Card className="min-h-[158px] rounded-t-none py-4 px-5">
              <div className="flex">
                <StatusBadge label={education.status.value} />
                {/* For desktop */}
                <EducationAction education={education} />
                {/* For mobile */}
                <EllipsisVertical
                  size={21}
                  className="text-neutral-900 cursor-pointer sm:hidden"
                  onClick={() => handleActionMenuClick(education)}
                />
              </div>
              <p className="text-lg font-semibold leading-tight mt-[8px] mb-[6px]">
                {education.title}
              </p>
              <p className="text-sm text-neutral-700 mt-1">
                {education.description}
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
          title="Are you sure you want to delete this education?"
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
          name={education?.title || ""}
          onSaveClick={handleRenameConfirm}
          isProcessing={isProcessing}
          label="Education"
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
