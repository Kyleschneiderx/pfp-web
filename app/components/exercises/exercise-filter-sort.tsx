"use client";

import { ErrorModel } from "@/app/models/error_model";
import { CategoryOptionsModel } from "@/app/models/exercise_model";
import { getExerciseCategories } from "@/app/services/client_side/exercises";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import FilterSort from "../elements/FilterSort";
import Input from "../elements/Input";

export default function ExerciseFilterSort() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [categories, setCategories] = useState<CategoryOptionsModel[]>([]);
  const [filterValues, setFilterValues] = useState({
    sets_from: 0,
    sets_to: 0,
    reps_from: 0,
    reps_to: 0,
  });

  const getCategories = async () => {
    try {
      const list = await getExerciseCategories();
      const transformList = list.map((el) => ({
        label: el.value,
        value: el.id.toString(),
      }));
      setCategories(transformList);
    } catch (error) {
      const apiError = error as ErrorModel;
      const errorMessage =
        apiError.msg || "Failed to fetch exercise categories";
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const sortOptions = [
    { label: "Alphabetical (A-Z)", value: "name:ASC" },
    { label: "Alphabetical (Z-A)", value: "name:DESC" },
    { label: "Newest first", value: "id:DESC" },
    { label: "Oldest first", value: "id:ASC" },
  ];

  const updateURLParams = (key: string, value: number) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 0) {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleInputChange = (name: string, value: number) => {
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    updateURLParams(name, value);
  };

  const handleFilterSelect = (selectedFilter: string | string[]) => {
    const params = new URLSearchParams(searchParams);
    if (Array.isArray(selectedFilter) && selectedFilter.length > 0) {
      params.set("category_id", selectedFilter.join(","));
    } else {
      params.delete("category_id");
    }

    replace(`${pathname}?${params.toString()}`);
  };

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

  const inputClassNames = "!py-[6px] !px-4";

  return (
    <>
      <FilterSort
        options={categories}
        label="Filter"
        onSelect={handleFilterSelect}
        isMulti
      >
        <div className="mt-3 w-[300px]">
          <span>Sets</span>
          <div className="flex items-center mt-1 mb-3">
            <Input
              type="number"
              placeholder="0"
              value={filterValues.sets_from}
              onChange={(e) =>
                handleInputChange("sets_from", parseInt(e.target.value) || 0)
              }
              className={inputClassNames}
            />
            <span className="mx-2">-</span>
            <Input
              type="number"
              placeholder="0"
              value={filterValues.sets_to}
              onChange={(e) =>
                handleInputChange("sets_to", parseInt(e.target.value) || 0)
              }
              className={inputClassNames}
            />
          </div>
          <span>Reps</span>
          <div className="flex items-center mt-1">
            <Input
              type="number"
              placeholder="0"
              value={filterValues.reps_from}
              onChange={(e) =>
                handleInputChange("reps_from", parseInt(e.target.value) || 0)
              }
              className={inputClassNames}
            />
            <span className="mx-2">-</span>
            <Input
              type="number"
              placeholder="0"
              value={filterValues.reps_to}
              onChange={(e) =>
                handleInputChange("reps_to", parseInt(e.target.value) || 0)
              }
              className={inputClassNames}
            />
          </div>
        </div>
      </FilterSort>
      <FilterSort
        options={sortOptions}
        label="Sort"
        onSelect={handleSortSelect}
      />
    </>
  );
}
