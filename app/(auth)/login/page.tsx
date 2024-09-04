import Button from "@/app/ui/elements/Button";
import InputField from "@/app/ui/elements/InputField";
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
        <InputField
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <InputField
          id="password"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <Button label="Sign In" className="w-full" />
        <Link href="/forgot-password">
          <p className="text-center mt-7">Forgot Password?</p>
        </Link>
      </form>
    </>
  );
}
