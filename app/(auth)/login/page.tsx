"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <Image
        src="/images/logo.jpg"
        alt="Logo"
        width={172}
        height={80}
        className="mx-auto"
      />
      <form className="space-y-5 mt-8">
        <Input
          type="email"
          placeholder="Email"
          required
          onChange={() => {}}
        />
        <Input
          type="password"
          placeholder="Password"
          required
          onChange={() => {}}
        />
        <Button label="Sign In" className="w-full" />
        <Link href="/forgot-password">
          <p className="text-center mt-7">Forgot Password?</p>
        </Link>
      </form>
    </>
  );
}
