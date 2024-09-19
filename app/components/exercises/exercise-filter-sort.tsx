"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterSort from "../elements/FilterSort";

export default function ExerciseFilterSort() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const filterOptions = [
    { label: "All", value: "0" },
    { label: "Active", value: "1" },
    { label: "Inactive", value: "2" },
  ];

  const sortOptions = [
    { label: "Alphabetical (A-Z)", value: "name:ASC" },
    { label: "Alphabetical (Z-A)", value: "name:DESC" },
    { label: "Newest first", value: "id:DESC" },
    { label: "Oldest first", value: "id:ASC" },
  ];

  const handleFilterSelect = (selectedFilter: string) => {
    // const params = new URLSearchParams(searchParams);
    // if (selectedFilter) {
    //   params.set("status_id", selectedFilter);
    // } else {
    //   params.delete("status_id");
    // }
    // replace(`${pathname}?${params.toString()}`);
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
      <FilterSort
        options={filterOptions}
        label="Filter"
        onSelect={handleFilterSelect}
      />
      <FilterSort
        options={sortOptions}
        label="Sort"
        onSelect={handleSortSelect}
      />
    </>
  );
}
