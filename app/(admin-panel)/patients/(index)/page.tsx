import Button from "@/app/components/elements/Button";
import IconAddButton from "@/app/components/elements/mobile/IconAddButton";
import SearchCmp from "@/app/components/elements/SearchCmp";
import { fetchPatients } from "@/app/components/patients/actions";
import PatientFilterSort from "@/app/components/patients/patient-filter-sort";
import PatientList from "@/app/components/patients/patient-list";
import { PatientModel } from "@/app/models/patient_model";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page: string;
    name?: string;
    sort?: string;
    status_id?: string;
  };
}) {
  const name = searchParams?.name || "";
  const sort = searchParams?.sort || "name:ASC";
  const status_id = searchParams?.status_id || "";

  let patients: PatientModel[] = [];
  let maxPage: number = 0;
  let errorMessage: string = "";

  const displayNoRecord = (msg: string) => {
    return <p className="text-center mx-auto mt-[300px]">{msg}</p>;
  };

  try {
    const { patientList, max_page } = await fetchPatients({
      name,
      sort,
      status_id,
    });
    patients = patientList;
    maxPage = max_page;
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  return (
    <>
      <div className="flex items-center mb-8">
        <SearchCmp placeholder="Search patients" className="mr-4 sm:mr-0" />
        <PatientFilterSort />
        <Link href="/patients/create" className="ml-auto">
          <Button label="Add Patients" showIcon className="hidden sm:flex" />
          <IconAddButton className="sm:hidden" />
        </Link>
      </div>
      <div>
        {errorMessage ? (
          displayNoRecord(errorMessage)
        ) : (
          <PatientList
            initialList={patients}
            name={name}
            sort={sort}
            status_id={status_id}
            maxPage={maxPage}
          />
        )}
      </div>
    </>
  );
}
