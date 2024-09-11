"use client";

import Button from "@/app/components/elements/Button";
import Card from "@/app/components/elements/Card";
import ConfirmModal from "@/app/components/elements/ConfirmModal";
import DateInput from "@/app/components/elements/DateInput";
import Input from "@/app/components/elements/Input";
import ReqIndicator from "@/app/components/elements/ReqIndicator";
import Select from "@/app/components/elements/Select";
import Textarea from "@/app/components/elements/Textarea";
import ToggleSwitch from "@/app/components/elements/ToggleSwitch";
import UploadCmp from "@/app/components/elements/UploadCmp";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import countryCodes from "@/app/lib/country-codes.json";
import { Patients } from "@/app/models/patients";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  action: "Create" | "Edit";
  patient?: Patients;
}

export default function PatientForm({ action, patient }: Props) {
  const { showSnackBar } = useSnackBar();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [accountType, setAccountType] = useState<string>("Free");
  const [description, setDescription] = useState<string | undefined>();
  const [errors, setErrors] = useState<
    { fieldName: string; message: string }[]
  >([]);

  useEffect(() => {
    if (action === "Edit" && patient) {
      setName(patient.user_profile?.name);
      setEmail(patient.email);
      setContact(patient.user_profile?.contact_number);
      setBirthdate(new Date(patient.user_profile.birthdate));
      setAccountType(patient.account_type?.value);
      setDescription(patient.user_profile?.description);
    }
  }, [patient]);

  const [modalOpen, setModalOpen] = useState(false);

  const handleToggle = (label: string) => {
    setAccountType(label);
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleConfirm = () => {
    setModalOpen(false);
  };

  const isValid = () => {
    const newErrors = [];

    if (name.trim() === "") {
      newErrors.push({
        fieldName: "name",
        message: "Patient name is required.",
      });
    }
    if (email.trim() === "") {
      newErrors.push({
        fieldName: "email",
        message: "Email address is required.",
      });
    }
    if (contact.trim() === "") {
      newErrors.push({
        fieldName: "contact",
        message: "Contact number is required.",
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  useEffect(() => {
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => error.message).join("\n");
      showSnackBar({ message: errorMessages, success: false });
    }
  }, [errors]);

  const onSave = () => {
    if (isValid()) {
      handleOpenModal();
    }
  };

  const hasError = (fieldName: string) => {
    return errors.some((error) => error.fieldName === fieldName);
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
          <Button label="Save" onClick={onSave} />
        </div>
      </div>
      <hr />
      <div className="flex mt-8 space-x-8">
        <Card className="w-[636px] p-[22px] space-y-4">
          <div>
            <div className="flex justify-between items-end mb-2">
              <p className="font-medium">
                Patient Name <ReqIndicator />
              </p>
              <ToggleSwitch
                label1="Free"
                label2="Premium"
                active={accountType}
                onToggle={handleToggle}
              />
            </div>
            <Input
              type="text"
              placeholder="Enter patient name"
              value={name}
              invalid={hasError("name")}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {action === "Create" && (
            <>
              <div>
                <p className="font-medium mb-2">
                  Email Address <ReqIndicator />
                </p>
                <Input
                  type="email"
                  placeholder="Enter patient's email address"
                  value={email}
                  invalid={hasError("email")}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <p className="font-medium mb-2">
                  Contact Number <ReqIndicator />
                </p>
                <div className="flex space-x-3">
                  <Select id="country_code" name="country_code">
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.dial_code}>
                        {country.dial_code}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="text"
                    placeholder="xxx xxx xxx"
                    className="w-[482px]"
                    value={contact}
                    invalid={hasError("contact")}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          <div className="flex space-x-3">
            <div>
              <p className="font-medium mb-2">
                Date of Birth <ReqIndicator />
              </p>
              <DateInput
                selected={birthdate}
                onChange={(date) => setBirthdate(date)}
              />
            </div>
            <div>
              <p className="font-medium mb-2">Other Info</p>
              <Input type="text" placeholder="0" onChange={() => {}} />
            </div>
            <div>
              <p className="font-medium mb-2">Other Info</p>
              <Input type="text" placeholder="0" onChange={() => {}} />
            </div>
          </div>
          <div>
            <p className="font-medium mb-2">Description</p>
            <Textarea
              placeholder="Enter the exercise's description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </Card>
        <UploadCmp />
        <ConfirmModal
          title={`Are you sure you want to ${
            action === "Create"
              ? "create this Patient's account?"
              : "save this changes?"
          } `}
          subTitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum been."
          isOpen={modalOpen}
          confirmBtnLabel="Save"
          onConfirm={handleConfirm}
          onClose={handleCloseModal}
        />
      </div>
    </>
  );
}
