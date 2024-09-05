"use client";

import Button from "@/app/ui/elements/Button";
import InputField from "@/app/ui/elements/InputField";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import clsx from "clsx";
import { Circle, CircleCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [firstPass, setFirstPass] = useState<boolean>(false);
  const [secondPass, setSecondPass] = useState<boolean>(false);
  const [passwordMatch, setPasswordMatch] = useState<boolean>(true);

  const passwordChange = (data: React.ChangeEvent<HTMLInputElement>) => {
    const value = data.target.value;
    setFirstPass(value.length >= 8);
    setNewPassword(value);

    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(value);
    setSecondPass(hasLetter && hasNumber && hasSpecialChar);
    setPasswordMatch(value === confirmPassword);
  };

  const confirmPassChange = (data: React.ChangeEvent<HTMLInputElement>) => {
    const value = data.target.value;
    setConfirmPassword(value);
    setPasswordMatch(value === newPassword);
  };

  return (
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
      <form className="mt-6">
        <div>
          <p className="text-sm font-medium mb-2">Password</p>
          <InputField
            id="password"
            type="password"
            name="password"
            placeholder="Enter your new password"
            required
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
          <div className="flex items-center">
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
            <p className={clsx("text-sm", secondPass && "text-success-600")}>
              At least 1 letter, 1 number and 1 special character
            </p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm font-medium mb-2">Confirm Password</p>
          <InputField
            id="confirm-password"
            type="password"
            name="confirm-password"
            placeholder="Re-enter password"
            required
            onChange={confirmPassChange}
            className={clsx(
              newPassword &&
                confirmPassword &&
                !passwordMatch &&
                "border-error-600 focus:border-error-600 bg-error-50"
            )}
          />
          {newPassword && confirmPassword && !passwordMatch && (
            <p className="text-sm text-error-600 mt-2">
              Password does not match.
            </p>
          )}
        </div>
        <Button label="Reset Password" className="w-full mt-10" />
      </form>
    </>
  );
}
