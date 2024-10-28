import clsx from "clsx";
import { CirclePlus } from "lucide-react";
import Loader from "./Loader";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
  secondary?: boolean;
  outlined?: boolean;
  className?: string;
  disabled?: boolean;
  isProcessing?: boolean;
}

export default function Button({
  label,
  showIcon = false,
  icon,
  secondary,
  outlined,
  children,
  className,
  disabled = false,
  isProcessing = false,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type="button"
      className={clsx(
        "flex justify-center items-center py-3 px-6 rounded-md font-medium",
        disabled || isProcessing
          ? "bg-neutral-300 cursor-default text-white"
          : secondary
          ? "bg-white text-black hover:bg-neutral-100 active:bg-white drop-shadow"
          : outlined
          ? "border border-primary-600 text-primary-500 hover:bg-primary-600 hover:text-white"
          : "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-500",
        className
      )}
    >
      {isProcessing && <Loader className="text-white" />}
      {icon && icon}
      {label}
      {showIcon && <CirclePlus className="ml-3" />}
    </button>
  );
}
