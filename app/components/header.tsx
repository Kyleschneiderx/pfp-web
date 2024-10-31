"use client";

import Cookies from "js-cookie";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useToggle } from "../store/store";

export default function Header() {
  const userName = Cookies.get("user_name");
  const userEmail = Cookies.get("user_email");

  const { isOpen, setIsOpen } = useToggle();

  return (
    <header className="py-3 px-4 border-b border-neutral-300 flex items-center">
      <Menu className="mr-2 sm:hidden" onClick={() => setIsOpen(!isOpen)}/>
      <Image
        src="/images/logo.jpg"
        alt="Logo"
        width={106}
        height={50}
        quality={100}
        className="w-[106px] h-[50px] sm:hidden"
        priority
      />
      <div className="text-right ml-auto mr-2 sm:mr-3">
        <span className="block font-medium text-neutral-900 w-[100px] sm:w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
          {userName}
        </span>
        <span className="block text-sm text-neutral-700 w-[105px] sm:w-[300px] overflow-hidden text-ellipsis">
          {userEmail}
        </span>
      </div>
      <Image
        src="/images/avatar.png"
        alt="Logo"
        width={55}
        height={55}
        quality={100}
        className="rounded-full sm:mr-3 h-[55px] w-[55px]"
      />
    </header>
  );
}
