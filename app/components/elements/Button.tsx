import clsx from "clsx";
import { CirclePlus } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: String;
  showIcon?: boolean;
  secondary?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function Button({
  label,
  showIcon = false,
  secondary,
  children,
  className,
  disabled = false,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type="button"
      className={clsx(
        "flex justify-center items-center py-3 px-4 rounded-md",
        disabled
          ? "bg-primary-300 cursor-default text-white"
          : secondary
          ? "bg-white text-black hover:bg-neutral-100 active:bg-primary-200 drop-shadow"
          : "bg-primary-500 text-white hover:bg-primary-300 active:bg-primary-500",
        className
      )}
    >
      {label} {showIcon && <CirclePlus className="ml-3" />}
    </button>
  );
}
