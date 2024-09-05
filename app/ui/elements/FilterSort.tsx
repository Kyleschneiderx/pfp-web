"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Card from "./Card";

interface Props {
  label: string;
  options: Array<{ label: string; value: string }>;
}

export default function FilterSort({ label, options = [] }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
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
                  <input
                    key={index}
                    id={`id${index}`}
                    type="checkbox"
                    value={option.value}
                    className="mr-2 cursor-pointer"
                  />
                  <label htmlFor={`id${index}`} className="cursor-pointer">
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
