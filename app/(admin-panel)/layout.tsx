"use client";

import Navigation from "@/app/components/navigation";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import NavigationMobile from "../components/navigation-mobile";
import { useToggle } from "../store/store";

const Header = dynamic(() => import("@/app/components/header"), { ssr: false });

export default function RootLayout({ children }: { children: ReactNode }) {
  const { isOpen } = useToggle();

  return (
    <div className="flex h-screen">
      <div className="hidden sm:block">
        <Navigation />
      </div>
      <div className="flex flex-col w-full">
        <Header />
        <div className="relative">
          <div
            className={clsx("absolute z-50", !isOpen ? "hidden" : "sm:hidden")}
          >
            <NavigationMobile />
          </div>
          <main className="bg-primary-50 h-[calc(100vh-85px)] relative main-inner-left-shadow p-5 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
