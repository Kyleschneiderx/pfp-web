import { samplePatients } from "@/app/lib/sample-data";
import { formatDateToLocal } from "@/app/lib/utils";
import Button from "@/app/ui/elements/Button";
import Card from "@/app/ui/elements/Card";
import FilterSort from "@/app/ui/elements/FilterSort";
import InputField from "@/app/ui/elements/InputField";
import clsx from "clsx";
import { EllipsisVertical, Mail, PhoneCall } from "lucide-react";
import Image from "next/image";

export default function Page() {
  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const sortOptions = [
    { label: "Alphabetical (A-Z)", value: "asc" },
    { label: "Alphabetical (Z-A)", value: "desc" },
    { label: "Latest to Oldest Log-in", value: "latest-login" },
    { label: "Oldest to Latest Log-in", value: "oldest-login" },
  ];
  return (
    <>
      <div className="flex items-center mb-8">
        <div className="w-[540px]">
          <InputField
            id="search"
            type="text"
            name="search"
            placeholder="Search patient"
            icon="Search"
          />
        </div>
        <FilterSort options={filterOptions} label="Filter" />
        <FilterSort options={sortOptions} label="Sort" />
        <Button label="Add Patients" showIcon className="ml-auto" />
      </div>
      <div className="flex flex-wrap">
        {samplePatients.map((patient) => (
          <Card
            key={patient.id}
            className="p-5 w-[390px] flex mr-9 mb-9 text-neutral-900"
          >
            <Image
              src="/images/user.png"
              width={50}
              height={50}
              alt="Profile pic"
              className="self-start"
            />
            <div className="px-4 w-[300px]">
              <p className="text-lg font-semibold mb-1">
                {patient.user_profile.name}
              </p>
              <p className="text-neutral-500 text-xs mb-1">
                Last Log-in a month ago
              </p>
              <div className="flex text-sm mb-1">
                <p className="mr-2 text-neutral-800 w-[100px] font-medium">
                  Date of Birth
                </p>
                <p className="text-neutral-700">
                  {formatDateToLocal(patient.user_profile.birthdate)}
                </p>
              </div>
              <div className="flex text-sm mb-1">
                <p className="mr-2 text-neutral-800 w-[100px] font-medium">
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
            <EllipsisVertical className="text-neutral-900 ml-auto" />
          </Card>
        ))}
      </div>
    </>
  );
}
