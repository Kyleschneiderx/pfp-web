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
import { revalidatePage } from "@/app/lib/revalidate";
import { formatDate, onPhoneNumKeyDown } from "@/app/lib/utils";
import { ErrorModel } from "@/app/models/error_model";
import { PatientModel } from "@/app/models/patient_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";
import {
  createPatient,
  updatePatient,
} from "@/app/services/client_side/patients";
import Link from "next/link";
import { useEffect, useState } from "react";
import { validateForm } from "./validation";

interface Props {
  action: "Create" | "Edit";
  patient?: PatientModel;
}

export default function PatientForm({ action = "Create", patient }: Props) {
  const { showSnackBar } = useSnackBar();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [contactNo, setContactNo] = useState<string>("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [userType, setUserType] = useState<number>(1);
  const [description, setDescription] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (action === "Edit" && patient) {
      setName(patient.user_profile?.name);
      setEmail(patient.email);
      setContactNo(patient.user_profile?.contact_number ?? "");
      setBirthdate(
        patient.user_profile.birthdate
          ? new Date(patient.user_profile.birthdate)
          : null
      );
      setUserType(patient.user_type?.id);
      setDescription(patient.user_profile?.description ?? "");
    }
  }, [patient]);

  const [modalOpen, setModalOpen] = useState(false);

  const handleToggle = (label: string) => {
    setUserType(label === "Free" ? 1 : 2);
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalOpen(false);
    }
  };

  const isValid = () => {
    const validationErrors = validateForm(name, email, contactNo, birthdate);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  useEffect(() => {
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => error.message).join("\n");
      showSnackBar({ message: errorMessages, success: false });
    }
  }, [errors]);

  const handleFileSelect = (file: File | null) => {
    setPhoto(file);
  };

  const handleConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        if (action === "Create") {
          await createPatient({
            name: name,
            email: email,
            contactNo: contactNo,
            birthdate: birthdate ? formatDate(birthdate) : "",
            description: description,
            userType: userType,
            photo: photo,
          });
        } else {
          await updatePatient({
            id: patient?.id,
            name: name,
            email: email,
            contactNo: contactNo,
            birthdate: birthdate ? formatDate(birthdate) : "",
            description: description,
            userType: userType,
            photo: photo,
          });
        }
        await revalidatePage("/patients");
        setIsProcessing(false);
        showSnackBar({
          message: `Patient successfully ${
            action === "Create" ? "created" : "updated"
          }.`,
          success: true,
        });
        setModalOpen(false);
        clearData();
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

  const onSave = () => {
    if (isValid()) {
      handleOpenModal();
    }
  };

  const hasError = (fieldName: string) => {
    return errors.some((error) => error.fieldName === fieldName);
  };

  const clearData = () => {
    setName("");
    setEmail("");
    setContactNo("");
    setBirthdate(null);
    setUserType(1);
    setDescription("");
    setPhoto(null);
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
                active={userType === 1 ? "Free" : "Premium"}
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
                value={contactNo}
                invalid={hasError("contactNo")}
                onChange={(e) => setContactNo(e.target.value)}
                onKeyDown={onPhoneNumKeyDown}
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <div>
              <p className="font-medium mb-2">
                Date of Birth <ReqIndicator />
              </p>
              <DateInput
                selected={birthdate}
                invalid={hasError("birthdate")}
                maxDate={new Date()}
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
        <UploadCmp
          onFileSelect={handleFileSelect}
          clearImagePreview={photo === null}
        />
        <ConfirmModal
          title={`Are you sure you want to ${
            action === "Create"
              ? "create this Patient's account?"
              : "save this changes?"
          } `}
          subTitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum been."
          isOpen={modalOpen}
          confirmBtnLabel="Save"
          isProcessing={isProcessing}
          onConfirm={handleConfirm}
          onClose={handleCloseModal}
        />
      </div>
    </>
  );
}
