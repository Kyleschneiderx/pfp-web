import BigCheck from "@/public/svg/big-check.svg";
import Image from "next/image";
import Link from "next/link";
import Button from "../elements/Button";

export default function ResetSuccess() {
  return (
    <div className="flex flex-col items-center text-center">
      <Image src={BigCheck} alt="Check" className="mt-6" />
      <h1 className="text-[32px] font-bold mt-3 mb-1">Successful</h1>
      <p className="text-neutral-600">
        Your new password has been set successfully! Please return to the login
        page to continue accessing your account.
      </p>
      <Link href="/login" className="mt-[100px] w-full">
        <Button label="Back to Login" className="w-full" />
      </Link>
    </div>
  );
}
