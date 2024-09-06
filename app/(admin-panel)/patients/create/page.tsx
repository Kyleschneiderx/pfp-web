import Button from "@/app/components/elements/Button";
import Card from "@/app/components/elements/Card";
import InputField from "@/app/components/elements/InputField";
import Select from "@/app/components/elements/select";
import Textarea from "@/app/components/elements/textarea";
import countryCodes from "@/app/lib/country-codes.json";

export default function Page() {
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
          <Button label="Cancel" secondary />
          <Button label="Save" type="submit" />
        </div>
      </div>
      <hr />
      <div className="flex mt-8 space-x-8">
        <Card className="w-[636px] p-[22px] space-y-4">
          <div>
            <p className="font-medium mb-2">Patient Name</p>
            <InputField
              id="name"
              type="text"
              name="name"
              placeholder="Enter patient name"
              required
            />
          </div>
          <div>
            <p className="font-medium mb-2">Email Address</p>
            <InputField
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
              <InputField
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
              <InputField
                id="date"
                type="text"
                name="date"
                placeholder="mm/dd/yy"
                required
              />
            </div>
            <div>
              <p className="font-medium mb-2">Other Info</p>
              <InputField
                id="other1"
                type="text"
                name="other1"
                placeholder="0"
              />
            </div>
            <div>
              <p className="font-medium mb-2">Other Info</p>
              <InputField
                id="other2"
                type="text"
                name="other2"
                placeholder="0"
              />
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
        <Card className="w-[446px] h-[292px] p-[22px]">test</Card>
      </div>
    </form>
  );
}
