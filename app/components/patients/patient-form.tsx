"use client";

import Button from "@/app/components/elements/Button";
import Card from "@/app/components/elements/Card";
import DateInput from "@/app/components/elements/DateInput";
import Input from "@/app/components/elements/Input";
import Select from "@/app/components/elements/Select";
import Textarea from "@/app/components/elements/Textarea";
import ToggleSwitch from "@/app/components/elements/ToggleSwitch";
import UploadCmp from "@/app/components/elements/UploadCmp";
import countryCodes from "@/app/lib/country-codes.json";
import { Patients } from "@/app/models/patients";
import Link from "next/link";
import { useState } from "react";

interface Props {
  action: "Create" | "Edit";
  patient?: Patients;
}

export default function PatientForm({ action, patient }: Props) {
  const [birthdate, setBirthdate] = useState<Date | null>(
    patient ? new Date(patient.user_profile.birthdate) : null
  );
  const [accountType, setAccountType] = useState<string>(
    patient ? patient.user_type.value : "Free"
  );
  const [desc, setDesc] = useState<string | undefined>(
    patient?.user_profile.description
  );

  const handleToggle = (label: string) => {
    setAccountType(label);
  };

  return (
    <>
      <div className="flex items-center mb-7">
        <div>
          <h1 className="text-2xl font-semibold">{action} Patients</h1>
          <p className="text-sm text-neutral-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ante ipsum
            primis in faucibus.
          </p>
        </div>
        <div className="flex ml-auto space-x-3">
          <Link href="/patients">
            <Button label="Cancel" secondary />
          </Link>
          <Button label="Save" />
        </div>
      </div>
      <hr />
      <div className="flex mt-8 space-x-8">
        <Card className="w-[636px] p-[22px] space-y-4">
          <div>
            <div className="flex justify-between items-end mb-2">
              <p className="font-medium">Patient Name</p>
              <ToggleSwitch
                label1="Free"
                label2="Premium"
                active={accountType}
                onToggle={handleToggle}
              />
            </div>
            <Input
              id="name"
              type="text"
              name="name"
              placeholder="Enter patient name"
              required
              value={patient?.user_profile?.name}
            />
          </div>
          {action === "Create" && (
            <>
              <div>
                <p className="font-medium mb-2">Email Address</p>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter patient's email address"
                  required
                />
              </div>
              <div>
                <p className="font-medium mb-2">Contact Number</p>
                <div className="flex space-x-3">
                  <Select id="country_code" name="country_code">
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.dial_code}>
                        {country.dial_code}
                      </option>
                    ))}
                  </Select>
                  <Input
                    id="contact"
                    type="text"
                    name="contact"
                    placeholder="xxx xxx xxx"
                    required
                    className="w-[482px]"
                  />
                </div>
              </div>
            </>
          )}
          <div className="flex space-x-3">
            <div>
              <p className="font-medium mb-2">Date of Birth</p>
              <DateInput
                selected={birthdate}
                onChange={(date) => setBirthdate(date)}
              />
            </div>
            <div>
              <p className="font-medium mb-2">Other Info</p>
              <Input id="other1" type="text" name="other1" placeholder="0" />
            </div>
            <div>
              <p className="font-medium mb-2">Other Info</p>
              <Input id="other2" type="text" name="other2" placeholder="0" />
            </div>
          </div>
          <div>
            <p className="font-medium mb-2">Description</p>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter the exercise's description"
              rows={3}
              required
              value={desc}
            />
          </div>
        </Card>
        <UploadCmp />
      </div>
    </>
  );
}
