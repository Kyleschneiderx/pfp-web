import Header from "@/app/components/header";
import Navigation from "@/app/components/navigation";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div id="main" className="flex h-screen">
      <Navigation />
      <div className="flex flex-col w-full">
        <Header />
        <main className="bg-primary-50 h-full relative main-inner-left-shadow p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
