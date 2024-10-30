"use client";

import clsx from "clsx";
import { ArrowDownUp, Filter } from "lucide-react";
import { useState } from "react";

interface Props {
  options: Array<{ label: string; value: string }>;
  onSelect: (selectedValue: string | string[]) => void;
  isMulti?: boolean;
  isSort?: boolean;
  children?: React.ReactNode;
}

export default function FilterSortMobile({
  options = [],
  onSelect,
  isMulti = false,
  isSort = true,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string | string[]>(
    isMulti ? [] : ""
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string) => {
    if (isMulti) {
      let newSelectedValues: string[] = Array.isArray(selectedValue)
        ? [...selectedValue]
        : [];
      if (newSelectedValues.includes(value)) {
        newSelectedValues = newSelectedValues.filter((v) => v !== value);
      } else {
        newSelectedValues.push(value);
      }
      setSelectedValue(newSelectedValues);
      onSelect(newSelectedValues);
    } else {
      const newValue = value === selectedValue ? "" : value;
      setSelectedValue(newValue || "");
      onSelect(newValue);
    }
  };

  const isSelected = (value: string) => {
    if (isMulti && Array.isArray(selectedValue)) {
      return selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  return (
    <div className="relative flex select-none mr-4 sm:hidden">
      {isSort ? (
        <ArrowDownUp
          size={20}
          strokeWidth={3}
          className="cursor-pointer"
          onClick={toggleDropdown}
        />
      ) : (
        <Filter
          size={20}
          fill="black"
          className="cursor-pointer"
          onClick={toggleDropdown}
        />
      )}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20"
          onClick={toggleDropdown}
        />
      )}
      <div
        className={clsx(
          "fixed bottom-0 w-full left-1/2 -translate-x-1/2 z-20 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="bg-white p-5 rounded-t-2xl rounded-b-none">
          <p className="text-xl font-semibold mb-3">
            {isSort ? "Sort by" : "Select Filter"}
          </p>
          <ul className="space-y-4 max-h-[200px] overflow-auto font-semibold mb-3">
            {options.map((option, index) => (
              <li key={`li${option.value}`}>
                <label
                  htmlFor={`id${option.value}`}
                  className="flex items-center"
                >
                  <input
                    id={`id${option.value}`}
                    type="checkbox"
                    checked={isSelected(option.value)}
                    onChange={() => handleSelect(option.value)}
                    className="mr-2"
                  />
                  {option.label}
                </label>
              </li>
            ))}
          </ul>
          {children}
        </div>
      </div>
    </div>
  );
}
