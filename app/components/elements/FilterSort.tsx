"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Card from "./Card";

interface Props {
  label: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (selectedValue: string | string[]) => void;
  isMulti?: boolean;
  children?: React.ReactNode;
}

export default function FilterSort({
  label,
  options = [],
  onSelect,
  isMulti = false,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string | string[]>(isMulti ? [] : "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string) => {
    if (isMulti) {
      let newSelectedValues: string[] = Array.isArray(selectedValue) ? [...selectedValue] : [];
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isSelected = (value: string) => {
    if (isMulti && Array.isArray(selectedValue)) {
      return selectedValue.includes(value);
    }
    return selectedValue === value;
  }

  return (
    <div
      className="hidden sm:flex relative text-sm font-medium select-none"
      ref={dropdownRef}
    >
      <p className="ml-7 mr-1">{label}</p>
      <ChevronDown
        size={20}
        className="cursor-pointer"
        onClick={toggleDropdown}
      />
      {isOpen && (
        <div className="absolute left-7 mt-8 min-w-64 z-20">
          <Card className="p-5">
            <ul className="space-y-3 max-h-[200px] overflow-auto">
              {options.map((option, index) => (
                <li key={`li${option.value}`}>
                  <label
                    htmlFor={`id${index}`}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      id={`id${index}`}
                      type="checkbox"
                      checked={isSelected(option.value)}
                      onChange={() => handleSelect(option.value)}
                      className="mr-2 cursor-pointer"
                    />
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
            {children}
          </Card>
        </div>
      )}
    </div>
  );
}
