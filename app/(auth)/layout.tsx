import { ReactNode } from "react";
import Card from "../ui/elements/Card";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main>
      <div className="relative bg-cover bg-center h-screen bg-[url('/images/login-bg.png')]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/95 to-primary-50/70" />
        <div className="flex items-center justify-center h-screen">
          <Card className="w-[500px]">{children}</Card>
        </div>
      </div>
    </main>
  );
}
