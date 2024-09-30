"use client";

import { formatDateToLocal, getLastLoginStatus } from "@/app/lib/utils";
import { PatientModel } from "@/app/models/patient_model";
import clsx from "clsx";
import { Mail, PhoneCall } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Card from "../elements/Card";
import Loader from "../elements/Loader";
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
  const [patients, setPatients] = useState(initialList);
  const [page, setPage] = useState(1);
  const [ref, inView] = useInView();

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

  return (
    <>
      <div className="flex flex-wrap">
        {patients.map((patient) => (
          <Card
            key={patient.id}
            className="p-4 pr-3 w-[351px] flex mr-7 mb-7 text-neutral-900"
          >
            <Image
              src={patient.user_profile.photo || "/images/avatar.png"}
              width={50}
              height={50}
              alt="Profile pic"
              className="self-start"
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
            <PatientAction patient={patient} />
          </Card>
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
