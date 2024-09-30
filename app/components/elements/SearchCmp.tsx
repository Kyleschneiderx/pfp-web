"use client";

import Input from "@/app/components/elements/Input";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface Prop {
  placeholder: string;
  className?: string;
  onChange?: (text: string) => void;
}

export default function SearchCmp({ placeholder, className, onChange }: Prop) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    if (onChange) {
      onChange(term);
    } else {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set("name", term);
      } else {
        params.delete("name");
      }
      replace(`${pathname}?${params.toString()}`);
    }
  }, 300);

  return (
    <div className={clsx("w-[540px]", className)}>
      <Input
        id="search"
        type="text"
        name="search"
        placeholder={placeholder}
        icon="Search"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("name")?.toString()}
      />
    </div>
  );
}
