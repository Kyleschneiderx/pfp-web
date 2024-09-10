"use client";

import Card from "@/app/components/elements/Card";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Props {
  editUrl: string;
  onDeleteClick: () => void;
}

export default function ActionMenu({ editUrl, onDeleteClick }: Props) {
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

  const itemClass =
    "block w-full py-2 px-4 hover:bg-primary-100 hover:text-primary-500 cursor-pointer";

  return (
    <div ref={dropdownRef} className="relative text-neutral-600 text-sm">
      <EllipsisVertical
        size={20}
        className="text-neutral-900 cursor-pointer"
        onClick={toggleDropdown}
      />
      {isOpen && (
        <div className="absolute mt-1 w-44 z-20 right-0">
          <Card className="px-0 pt-2 pb-2">
            <ul>
              <li>
                <Link href={editUrl} className={itemClass}>
                  <span>Edit</span>
                </Link>
              </li>
              <li>
                <Link href="#" className={itemClass} onClick={onDeleteClick}>
                  <span>Delete</span>
                </Link>
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
