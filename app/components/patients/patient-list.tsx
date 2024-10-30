"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { CONFIRM_DELETE_DESCRIPTION, CONFIRM_INVITE_DESCRIPTION } from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDateToLocal, getLastLoginStatus } from "@/app/lib/utils";
import { ErrorModel } from "@/app/models/error_model";
import { PatientModel } from "@/app/models/patient_model";
import { deletePatient, sendInvite } from "@/app/services/client_side/patients";
import { useActionMenuStore } from "@/app/store/store";
import clsx from "clsx";
import { EllipsisVertical, Mail, PhoneCall } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Card from "../elements/Card";
import ConfirmModal from "../elements/ConfirmModal";
import Loader from "../elements/Loader";
import ActionMenuMobile from "../elements/mobile/ActionMenuMobile";
import { fetchPatients } from "./actions";
import PatientAction from "./patient-action";

export default function PatientList({
  name,
  sort,
  status_id,
  initialList,
  maxPage,
}: {
  name: string;
  sort: string;
  status_id: string;
  initialList: PatientModel[] | [];
  maxPage: number;
}) {
  const { patient, setPatient, setEditUrl, setIsOpen } = useActionMenuStore();

  const [patients, setPatients] = useState(initialList);
  const [page, setPage] = useState(1);
  const [ref, inView] = useInView();

  const { showSnackBar } = useSnackBar();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSendInviteOpen, setModalSendInviteOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalOpen(false);
      setModalSendInviteOpen(false);
    }
  };

  const loadMorePatients = async () => {
    const next = page + 1;
    const { patientList } = await fetchPatients({
      page: next,
      name,
      sort,
      status_id,
    });
    if (patientList.length) {
      setPage(next);
      setPatients((prev: PatientModel[]) => [
        ...(prev?.length ? prev : []),
        ...patientList,
      ]);
    }
  };

  useEffect(() => {
    if (inView && page < maxPage) {
      loadMorePatients();
    }
  }, [inView]);

  useEffect(() => {
    setPatients(initialList);
    setPage(1);
  }, [sort, name, status_id, initialList]);

  const handleActionMenuClick = (patient: PatientModel) => {
    setIsOpen(true);
    setPatient(patient);
    setEditUrl(`patients/${patient.id}/edit`);
  };

  const handleConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        await deletePatient(patient!.id);
        await revalidatePage("/patients");
        setIsProcessing(false);
        showSnackBar({
          message: `Patient successfully deleted.`,
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
      }
    }
  };

  const handleSendInviteConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        await sendInvite(patient!.id);
        await revalidatePage("/patients");
        setIsProcessing(false);
        showSnackBar({
          message: `Invitation successfully sent.`,
          success: true,
        });
        setModalSendInviteOpen(false);
        setIsOpen(false);
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
        setModalSendInviteOpen(false);
      }
    }
  };

  return (
    <>
      <div className="flex flex-wrap">
        {patients.map((patient) => (
          <Card
            key={patient.id}
            className="p-4 pr-3 w-[351px] flex mx-auto sm:mx-0 sm:mr-7 mb-7 text-neutral-900"
          >
            <Image
              src={patient.user_profile.photo || "/images/avatar.png"}
              width={50}
              height={50}
              alt="Profile pic"
              quality={100}
              className="self-start w-[50px] h-[50px]"
            />
            <div className="pl-4 pr-2 w-[300px]">
              <p className="text-lg font-semibold mb-1">
                {patient.user_profile.name}
              </p>
              <p
                className={clsx(
                  "text-xs mb-1",
                  patient.last_login_at ||
                    getLastLoginStatus(patient.last_login_at ?? "") === "Active"
                    ? "text-green-500"
                    : "text-neutral-500"
                )}
              >
                {patient.status.value === "Inactive"
                  ? "Inactive"
                  : patient.last_login_at
                  ? getLastLoginStatus(patient.last_login_at)
                  : ""}
              </p>
              <div className="flex text-sm mb-1">
                <p className="mr-2 text-neutral-800 w-[90px] font-medium">
                  Date of Birth
                </p>
                <p className="text-neutral-700">
                  {formatDateToLocal(patient.user_profile.birthdate)}
                </p>
              </div>
              <div className="flex text-sm mb-1">
                <p className="mr-2 text-neutral-800 w-[90px] font-medium">
                  Other info
                </p>
                <p
                  className={clsx("font-medium", {
                    "text-primary-500": patient.user_type.value == "Premium",
                  })}
                >
                  {patient.user_type.value} User
                </p>
              </div>
              <hr className="my-3" />
              <div className="text-neutral-700 text-sm">
                <div className="flex space-x-2 items-center mb-1">
                  <PhoneCall size={14} />
                  <p>{patient.user_profile.contact_number}</p>
                </div>
                <div className="flex space-x-2 items-center">
                  <Mail size={14} />
                  <p className="break-all">{patient.email}</p>
                </div>
              </div>
            </div>
            {/* For desktop */}
            <PatientAction patient={patient} />
            {/* For mobile */}
            <EllipsisVertical
              size={25}
              className="text-neutral-900 cursor-pointer sm:hidden"
              onClick={() => handleActionMenuClick(patient)}
            />
          </Card>
        ))}
        {/* For mobile */}
        <ActionMenuMobile
          onDeleteClick={handleOpenModal}
          onSendInviteClick={() => setModalSendInviteOpen(true)}
        />
        <ConfirmModal
          title="Are you sure you want to delete this account?"
          subTitle={CONFIRM_DELETE_DESCRIPTION}
          isOpen={modalOpen}
          confirmBtnLabel="Delete"
          isProcessing={isProcessing}
          onConfirm={handleConfirm}
          onClose={handleCloseModal}
        />
        <ConfirmModal
          title="Are you sure you want to send this invitation?"
          subTitle={CONFIRM_INVITE_DESCRIPTION}
          isOpen={modalSendInviteOpen}
          confirmBtnLabel="Send"
          isProcessing={isProcessing}
          onConfirm={handleSendInviteConfirm}
          onClose={handleCloseModal}
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
