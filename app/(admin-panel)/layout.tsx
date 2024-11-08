"use client";

import Navigation from "@/app/components/navigation";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import NavigationMobile from "../components/navigation-mobile";

const Header = dynamic(() => import("@/app/components/header"), { ssr: false });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <div className="hidden sm:block">
        <Navigation />
      </div>
      <div className="flex flex-col w-full">
        <Header />
        <div className="relative">
          <NavigationMobile />
          <main className="bg-primary-50 h-[calc(100vh-85px)] relative main-inner-left-shadow p-5 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
