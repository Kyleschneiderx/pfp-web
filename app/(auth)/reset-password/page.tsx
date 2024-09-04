import Button from "@/app/ui/elements/Button";
import InputField from "@/app/ui/elements/InputField";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import { Circle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
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
          />
        </div>
        <div className="mt-1 text-neutral-600">
          <p className="text-xs">Your password must contain</p>
          <div className="flex items-center">
            <Circle size={16} className="text-neutral-400 mr-1" />
            <p className="text-sm ">At least 8 characters</p>
          </div>
          <div className="flex items-center">
            <Circle size={16} className="text-neutral-400 mr-1" />
            <p className="text-sm">
              At least 1 letter, 1 number and 1 special characters
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
          />
        </div>
        <Button label="Reset Password" className="w-full mt-12" />
      </form>
    </>
  );
}
