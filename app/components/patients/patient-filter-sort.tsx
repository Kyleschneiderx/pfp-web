"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterSort from "../elements/FilterSort";

export default function PatientFilterSort() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const sortOptions = [
    { label: "Alphabetical (A-Z)", value: "ASC" },
    { label: "Alphabetical (Z-A)", value: "DESC" },
    { label: "Latest to Oldest Log-in", value: "last_login_at:DESC" },
    { label: "Oldest to Latest Log-in", value: "last_login_at:ASC" },
  ];

  const handleFilterSelect = (selectedFilter: string) => {
    console.log("Selected filter:", selectedFilter);
  };
  
  const handleSortSelect = (selectedSort: string) => {
    const params = new URLSearchParams(searchParams);
      if (selectedSort) {
        params.set("sort", selectedSort);
      } else {
        params.delete("sort");
      }
      replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <FilterSort options={filterOptions} label="Filter" onSelect={handleFilterSelect} />
      <FilterSort options={sortOptions} label="Sort" onSelect={handleSortSelect} />
    </>
  );
}
