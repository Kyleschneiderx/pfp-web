"use client";

import Button from "@/app/components/elements/Button";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { ErrorModel } from "@/app/models/error_model";
import { deletePatientAccount } from "@/app/services/client_side/patients";
import BigCheck from "@/public/svg/big-check.svg";
import Image from "next/image";
import { useState } from "react";

interface Props {
  params: {
    token: string;
  };
}

const DeleteSuccess = () => {
  return (
    <div className="flex flex-col items-center text-center">
      <Image src={BigCheck} alt="Check" className="mt-6" />
      <h1 className="text-[32px] font-bold mt-3 mb-1">Successful</h1>
      <p className="text-neutral-600">Successfully removed account.</p>
    </div>
  );
};

export default function page({ params }: Props) {
  const mobileToken = params.token;
  const { showSnackBar } = useSnackBar();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        await deletePatientAccount(mobileToken);
        setIsProcessing(false);
        setSuccess(true);
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="text-center">
      {success ? (
        <DeleteSuccess />
      ) : (
        <>
          <h1 className="text-[32px] font-bold tracking-[-0.3px]">
            Delete Account
          </h1>
          <p className="text-neutral-600">
            Once you delete your account, you will not be able to undo it. Are
            you sure you want to delete?
          </p>
          <p className="font-bold italic text-red-600">Note: Make sure you unsubscribe from premium plan before deleting your account.</p>
          <Button
            label="Delete"
            className="w-full mt-10"
            onClick={handleSubmit}
            isProcessing={isProcessing}
          />
        </>
      )}
    </div>
  );
}
