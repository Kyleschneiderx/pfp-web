import Header from "@/app/ui/header";
import Navigation from "@/app/ui/navigation";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Navigation />
      <div className="flex flex-col w-full">
        <Header />
        <main className="bg-primary-50 h-full relative main-inner-left-shadow">
          {children}
        </main>
      </div>
    </div>
  );
}
