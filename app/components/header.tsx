import { cookies } from "next/headers";
import Image from "next/image";

export default function Header() {
  const cookieStore = cookies();
  const userName = cookieStore.get("user_name")?.value;
  const userEmail = cookieStore.get("user_email")?.value;
  return (
    <header className="py-4 px-5 border-b border-neutral-300 flex items-center justify-end">
      <div className="text-right">
        <span className="block font-medium text-neutral-900">{userName}</span>
        <span className="block text-sm text-neutral-700">{userEmail}</span>
      </div>
      <Image
        src="/images/sample-avatar.png"
        alt="Logo"
        width={50}
        height={50}
        className="rounded-full mx-4"
      />
    </header>
  );
}
