"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import { validateForm } from "@/app/components/login/validation";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { ErrorModel } from "@/app/models/error_model";
import { LoginModel } from "@/app/models/login_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";
import { login } from "@/app/services/client_side/auth";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const { showSnackBar } = useSnackBar();
  const router = useRouter();

  const expireTime = {
    expires: 1 / 24, // expires in 1 hour
  };

  const setCookie = (name: string, value: string) => {
    Cookies.set(name, value, {
      ...expireTime,
      sameSite: "Strict",
      // secure: true, // enable this if the server is already https
    });
  };

  const isValid = () => {
    const validationErrors = validateForm(email, password);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  useEffect(() => {
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => error.message).join("\n");
      showSnackBar({ message: errorMessages, success: false });
    }
  }, [errors]);

  const handleLogin = async () => {
    if (isValid() && !isProcessing) {
      try {
        setIsProcessing(true);
        Cookies.remove("token");

        const response: LoginModel = await login(email, password);
        setCookie("token", response.token.access);
        setCookie("user_name", response.user.user_profile.name);
        setCookie("user_email", response.user.email);

        // window.location.replace("/dashboard");
        router.push("/dashboard");
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
      }
    }
  };

  const hasError = (fieldName: string) => {
    return errors.some((error) => error.fieldName === fieldName);
  };

  return (
    <form>
      <Image
        src="/images/logo.jpg"
        alt="Logo"
        width={172}
        height={80}
        quality={100}
        className="mx-auto w-[172px] h-[80px]"
        priority
      />
      <div className="space-y-5 mt-8">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          required
          invalid={hasError("email")}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
          invalid={hasError("password")}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          label="Sign In"
          className="w-full"
          onClick={handleLogin}
          isProcessing={isProcessing}
        />
        <Link href="/forgot-password">
          <p className="text-center mt-7">Forgot Password?</p>
        </Link>
      </div>
    </form>
  );
}
