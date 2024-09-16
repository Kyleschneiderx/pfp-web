"use client";

import Input from "@/app/components/elements/Input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function SearchPatient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("name", term);
    } else {
      params.delete("name");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="w-[540px]">
      <Input
        id="search"
        type="text"
        name="search"
        placeholder="Search patient"
        icon="Search"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("name")?.toString()}
      />
    </div>
  );
}
