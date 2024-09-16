"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Card from "./Card";

interface Props {
  label: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (selectedValue: string) => void;
}

export default function FilterSort({ label, options = [], onSelect }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string) => {
    const newValue = value === selectedValue ? "" : value;
    setSelectedValue(newValue || null);
    onSelect(newValue);
  }

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

  return (
    <div
      className="relative flex text-sm font-medium select-none"
      ref={dropdownRef}
    >
      <p className="ml-7 mr-1">{label}</p>
      <ChevronDown
        size={20}
        className="cursor-pointer"
        onClick={toggleDropdown}
      />
      {isOpen && (
        <div className="absolute left-7 mt-8 w-64 z-20">
          <Card className="p-5">
            <ul className="space-y-3">
              {options.map((option, index) => (
                <li>
                  <label
                    htmlFor={`id${index}`}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      id={`id${index}`}
                      type="checkbox"
                      checked={selectedValue === option.value}
                      onChange={() => handleSelect(option.value)}
                      className="mr-2 cursor-pointer"
                    />
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
