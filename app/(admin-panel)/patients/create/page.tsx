import Button from "@/app/ui/elements/Button";
import Card from "@/app/ui/elements/Card";

export default function Page() {
  return (
    <>
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
          <Button label="Save" />
        </div>
      </div>
      <hr />
      <div className="flex mt-8 space-x-8">
        <Card className="w-[640px] "></Card>
        <Card className="w-[450px]"></Card>
      </div>
    </>
  );
}
