import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main>
      <div className="relative bg-cover bg-center h-screen bg-[url('/images/login-bg.png')]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/95 to-primary-50/70" />
        <div className="flex items-center justify-center h-screen">
          <div className="relative w-[500px] z-10 rounded-md bg-white p-10 shadow-md">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
