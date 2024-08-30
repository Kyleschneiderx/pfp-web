import { Button } from "@/app/ui/elements/Button";
import InputField from "@/app/ui/elements/InputField";
import Image from "next/image";

export default function Page() {
  return (
    <div className="relative bg-cover bg-center h-screen bg-[url('/images/login-bg.png')]">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50/95 to-primary-50/70" />
      <div className="flex items-center justify-center h-screen">
        <div className="relative w-[500px] z-10 rounded-md bg-white p-10 shadow-md">
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
            <Button className="w-full">Sign In</Button>
            <p className="text-center">Forgot Password?</p>
          </form>
        </div>
      </div>
    </div>
  );
}
