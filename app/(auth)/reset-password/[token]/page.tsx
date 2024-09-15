"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import ResetSuccess from "@/app/components/login/reset-success";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { ErrorModel } from "@/app/models/error_model";
import { resetPassword } from "@/app/services/auth";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import EyeOff from "@/public/svg/eye-off.svg";
import Eye from "@/public/svg/eye.svg";
import clsx from "clsx";
import { Circle, CircleCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const PasswordToggleIcon = ({
  isVisible,
  onToggle,
}: {
  isVisible: boolean;
  onToggle: () => void;
}) => (
  <Image
    onClick={onToggle}
    src={isVisible ? Eye : EyeOff}
    alt={isVisible ? "Hide password" : "Show password"}
    className="absolute ml-3 right-4 top-1/2 transform -translate-y-1/2 w-5 text-neutral-600 cursor-pointer"
  />
);

interface Props {
  params: {
    token: string;
  };
}

export default function Page({ params }: Props) {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [firstPass, setFirstPass] = useState<boolean>(false);
  const [secondPass, setSecondPass] = useState<boolean>(false);
  const [passwordMatch, setPasswordMatch] = useState<boolean>(true);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const token = params.token;
  const { showSnackBar } = useSnackBar();

  const passwordChange = (data: React.ChangeEvent<HTMLInputElement>) => {
    const value = data.target.value;
    setFirstPass(value.length >= 8);
    setNewPassword(value);

    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(value);
    setSecondPass(hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar);
    setPasswordMatch(value === confirmPassword);
  };

  const confirmPassChange = (data: React.ChangeEvent<HTMLInputElement>) => {
    const value = data.target.value;
    setConfirmPassword(value);
    setPasswordMatch(value === newPassword);
  };

  useEffect(() => {
    setDisabled(
      !(
        newPassword.trim() &&
        confirmPassword &&
        passwordMatch &&
        firstPass &&
        secondPass
      )
    );
  }, [firstPass, secondPass, newPassword, confirmPassword, passwordMatch]);

  const onShowNewPass = () => {
    setShowNewPass((prev) => !prev);
  };

  const onShowConfirmPass = () => {
    setShowConfirmPass((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (!disabled && !isProcessing) {
      try {
        setIsProcessing(true);
        await resetPassword(newPassword, token);
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
    <>
      {success ? (
        <ResetSuccess />
      ) : (
        <>
          <Link href="/forgot-password">
            <Image src={ArrowLeft} alt="Arrow left" className="mb-3" />
          </Link>
          <h1 className="text-[32px] font-bold tracking-[-0.3px]">
            Set a new password
          </h1>
          <p className="text-neutral-600">
            Create a new password. Ensure it differs from previous ones for
            security.
          </p>
          <div className="mt-6">
            <div>
              <p className="text-sm font-medium mb-2">Password</p>
              <Input
                id="password"
                type={showNewPass ? "text" : "password"}
                name="password"
                placeholder="Enter your new password"
                required
                icon={
                  <PasswordToggleIcon
                    isVisible={showNewPass}
                    onToggle={onShowNewPass}
                  />
                }
                onChange={passwordChange}
              />
            </div>
            <div className="mt-1 text-neutral-600">
              <p className="text-xs">Your password must contain</p>
              <div className="flex items-center">
                {firstPass ? (
                  <CircleCheck
                    size={19}
                    fill="green"
                    stroke="white"
                    className="-ml-[2px] mr-1"
                  />
                ) : (
                  <Circle size={16} className="text-neutral-400 mr-1" />
                )}
                <p className={clsx("text-sm", firstPass && "text-success-600")}>
                  At least 8 characters
                </p>
              </div>
              <div className="flex items-start">
                {secondPass ? (
                  <CircleCheck
                    size={19}
                    fill="green"
                    stroke="white"
                    className="-ml-[2px] mr-1"
                  />
                ) : (
                  <Circle size={16} className="text-neutral-400 mr-1" />
                )}
                <p
                  className={clsx(
                    "text-sm w-[350px]",
                    secondPass && "text-success-600"
                  )}
                >
                  At least 8 characters and contains at least 1 number, special
                  character, lower case and upper case.
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Confirm Password</p>
              <Input
                id="confirm-password"
                type={showConfirmPass ? "text" : "password"}
                name="confirm-password"
                placeholder="Re-enter password"
                required
                icon={
                  <PasswordToggleIcon
                    isVisible={showConfirmPass}
                    onToggle={onShowConfirmPass}
                  />
                }
                onChange={confirmPassChange}
                invalid={
                  newPassword !== "" && confirmPassword !== "" && !passwordMatch
                }
              />
              {newPassword && confirmPassword && !passwordMatch && (
                <p className="text-sm text-error-600 mt-2">
                  Password does not match.
                </p>
              )}
            </div>
            <Button
              label="Reset Password"
              className="w-full mt-10"
              disabled={disabled}
              isProcessing={isProcessing}
              onClick={handleSubmit}
            />
          </div>
        </>
      )}
    </>
  );
}
