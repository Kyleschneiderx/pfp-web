"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterSort from "./elements/FilterSort";

export default function CommonSort({field}: {field: string}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const sortOptions = [
    { label: "Alphabetical (A-Z)", value: `${field}:ASC` },
    { label: "Alphabetical (Z-A)", value: `${field}:DESC` },
    { label: "Newest first", value: "id:DESC" },
    { label: "Oldest first", value: "id:ASC" },
  ];

  const handleSortSelect = (selectedSort: string | string[]) => {
    if (typeof selectedSort === "string") {
      const params = new URLSearchParams(searchParams);
      if (selectedSort) {
        params.set("sort", selectedSort);
      } else {
        params.delete("sort");
      }
      replace(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <>
      <FilterSort
        options={sortOptions}
        label="Sort"
        onSelect={handleSortSelect}
      />
    </>
  );
}
