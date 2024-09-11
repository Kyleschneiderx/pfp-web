"use client";

import Input from "@/app/components/elements/Input";

export default function SearchPatient() {
  return (
    <div className="w-[540px]">
      <Input
        id="search"
        type="text"
        name="search"
        placeholder="Search patient"
        icon="Search"
        onChange={() => {}}
      />
    </div>
  );
}
