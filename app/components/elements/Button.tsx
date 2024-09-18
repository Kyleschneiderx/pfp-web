import clsx from "clsx";
import { CirclePlus } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: String;
  showIcon?: boolean;
  secondary?: boolean;
  outlined?: boolean;
  className?: string;
  disabled?: boolean;
  isProcessing?: boolean;
}

export default function Button({
  label,
  showIcon = false,
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
          ? "border border-primary-600 text-primary-500 hover:bg-primary-500 hover:text-white"
          : "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-500",
        className
      )}
    >
      {isProcessing && (
        <svg
          className="animate-spin h-5 w-5 text-white mr-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      )}
      {label}
      {showIcon && <CirclePlus className="ml-3" />}
    </button>
  );
}
