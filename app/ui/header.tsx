import Image from "next/image";

export default function Header() {
  return (
    <header className="py-4 px-5 border-b border-neutral-300 flex items-center justify-end">
      <div className="text-right">
        <span className="block font-medium text-neutral-900">Musharof</span>
        <span className="block text-sm text-neutral-700">
          hello@tailgrids.com
        </span>
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
