import clsx from "clsx";
import { Plus } from "lucide-react";

interface Props {
  className?: string;
}

export default function IconAddButton({className}: Props) {
  return (
    <button className={clsx(className, "bg-primary-500 active:bg-primary-600 p-2 rounded-full")} >
      <Plus color="white" />
    </button>
  );
}
