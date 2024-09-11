"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
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
        <Input
          type="email"
          placeholder="Your Email"
          required
          onChange={() => {}}
        />
        <Button label="Reset Password" className="w-full" />
      </form>
    </>
  );
}
