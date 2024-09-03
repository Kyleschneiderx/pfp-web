import { Button } from "@/app/ui/elements/Button";
import InputField from "@/app/ui/elements/InputField";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
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
      <form className="space-y-5 mt-6">
        <InputField
          id="email"
          type="email"
          name="email"
          placeholder="Your Email"
          required
        />
        <Button className="w-full">Reset Password</Button>
      </form>
    </>
  );
}
