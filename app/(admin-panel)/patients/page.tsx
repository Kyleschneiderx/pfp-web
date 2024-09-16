import Button from "@/app/components/elements/Button";
import Card from "@/app/components/elements/Card";
import PatientAction from "@/app/components/patients/patient-action";
import PatientFilterSort from "@/app/components/patients/patient-filter-sort";
import SearchPatient from "@/app/components/patients/search-patient";
import { formatDateToLocal } from "@/app/lib/utils";
import { PatientModel } from "@/app/models/patient_model";
import { getPatients } from "@/app/services/server_side/patients";
import clsx from "clsx";
import { Mail, PhoneCall } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page: string;
    name?: string;
    sort?: string;
  };
}) {
  const page = Number(searchParams?.page) || 1;
  const name = searchParams?.name || "";
  const sort = searchParams?.sort || "ASC";
  console.log(searchParams)

  const response = await getPatients(`page=1&name=${name}&sort[]=${sort}&page_items=50`);
  const patientList: PatientModel[] = response.data;
  console.log(patientList.length);

  return (
    <>
      <div className="flex items-center mb-8">
        <SearchPatient />
        <PatientFilterSort />
        <Link href="/patients/create" className="ml-auto">
          <Button label="Add Patients" showIcon />
        </Link>
      </div>
      <div className="flex flex-wrap">
        {patientList.map((patient) => (
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
              <p className="text-neutral-500 text-xs mb-1">
                Last Log-in a month ago
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
    </>
  );
}
