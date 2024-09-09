"use client";

import Button from "@/app/components/elements/Button";
import Card from "@/app/components/elements/Card";
import DateInput from "@/app/components/elements/DateInput";
import Input from "@/app/components/elements/Input";
import Select from "@/app/components/elements/Select";
import Textarea from "@/app/components/elements/Textarea";
import ToggleSwitch from "@/app/components/elements/ToggleSwitch";
import countryCodes from "@/app/lib/country-codes.json";
import { Upload } from "lucide-react";
import { useState } from "react";

export default function CreatePatientForm() {
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [accountType, setAccountType] = useState<string>("Free");

  const handleToggle = (label: string) => {
    setAccountType(label);
  };

  return (
    <form>
      <div className="flex items-center mb-7">
        <div>
          <h1 className="text-2xl font-semibold">Add Patients</h1>
          <p className="text-sm text-neutral-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ante ipsum
            primis in faucibus.
          </p>
        </div>
        <div className="flex ml-auto space-x-3">
          <Button label="Cancel" secondary type="button" />
          <Button label="Save" type="submit" />
        </div>
      </div>
      <hr />
      <div className="flex mt-8 space-x-8">
        <Card className="w-[636px] p-[22px] space-y-4">
          <div>
            <div className="flex justify-between items-end mb-2">
              <p className="font-medium">Patient Name</p>
              <ToggleSwitch
                label1="Free"
                label2="Premium"
                active={accountType}
                onToggle={handleToggle}
              />
            </div>
            <Input
              id="name"
              type="text"
              name="name"
              placeholder="Enter patient name"
              required
            />
          </div>
          <div>
            <p className="font-medium mb-2">Email Address</p>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter patient's email address"
              required
            />
          </div>
          <div>
            <p className="font-medium mb-2">Contact Number</p>
            <div className="flex space-x-3">
              <Select id="country_code" name="country_code">
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.dial_code}>
                    {country.dial_code}
                  </option>
                ))}
              </Select>
              <Input
                id="contact"
                type="text"
                name="contact"
                placeholder="xxx xxx xxx"
                required
                className="w-[482px]"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <div>
              <p className="font-medium mb-2">Date of Birth</p>
              <DateInput
                selected={birthdate}
                onChange={(date) => setBirthdate(date)}
              />
            </div>
            <div>
              <p className="font-medium mb-2">Other Info</p>
              <Input id="other1" type="text" name="other1" placeholder="0" />
            </div>
            <div>
              <p className="font-medium mb-2">Other Info</p>
              <Input id="other2" type="text" name="other2" placeholder="0" />
            </div>
          </div>
          <div>
            <p className="font-medium mb-2">Description</p>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter the exercise's description"
              rows={3}
              required
            />
          </div>
        </Card>
        <Card className="w-[446px] h-[292px] p-[22px]">
          <p className="font-medium mb-2">Upload a Photo</p>
          <div className="flex flex-col items-center justify-center border border-dashed border-neutral-200 rounded-md h-[215px] bg-neutral-100">
            <div className="p-2 border rounded-full w-fit h-fit bg-white">
              <Upload size={20} className="text-primary-500" />
            </div>
            <div className="text-neutral-700 text-center mt-2">
              <p>
                <span className="text-primary-500">Click to upload</span> or
                drag and drop
              </p>
              <p className="mt-2">MP4, MOV, WMV, AVI or MKV</p>
              <p className="text-sm">(Max file size: 25GB)</p>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
}
