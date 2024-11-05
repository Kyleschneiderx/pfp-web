import clsx from "clsx";
import Button from "./Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function SidePanel({ isOpen, onClose, children }: Props) {
  return (
    <div
      className={clsx(
        "fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-auto p-4">{children}</div>
        <div className="p-4">
          <Button
            label="Done"
            secondary
            className="mr-2 sm:mr-0 !py-2 !px-4 ml-auto"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
}