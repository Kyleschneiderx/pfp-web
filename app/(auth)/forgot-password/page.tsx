"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import { validateForm } from "@/app/components/login/validation";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { ErrorModel } from "@/app/models/error_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";
import { forgotPassword } from "@/app/services/auth";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
  const { showSnackBar } = useSnackBar();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const isValid = () => {
    const validationErrors = validateForm(email);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  useEffect(() => {
    if (errors.length > 0) {
      showSnackBar({ message: errors[0]?.message, success: false });
    }
  }, [errors]);

  const handleSubmit = async () => {
    if (isValid() && !isProcessing) {
      try {
        setIsProcessing(true);
        const response = await forgotPassword(email);
        showSnackBar({ message: response.msg, success: true });
        setIsProcessing(false);
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
    <>
      <Link href="/login">
        <Image src={ArrowLeft} alt="Arrow left" className="mb-3" />
      </Link>
      <h1 className="text-[32px] font-bold tracking-[-0.3px]">
        Forgot Password
      </h1>
      <p className="text-neutral-600">
        Please enter your email to reset the password.
      </p>
      <div className="space-y-5 mt-6">
        <Input
          type="email"
          name="email"
          placeholder="Your Email"
          required
          invalid={errors.length > 0}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          label="Reset Password"
          className="w-full"
          onClick={handleSubmit}
          isProcessing={isProcessing}
        />
      </div>
    </>
  );
}
