import clsx from "clsx";
import { Search } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  className?: string;
}

export default function Button({
  icon,
  children,
  className,
  ...rest
}: InputFieldProps) {
  return (
    <div className="relative">
      <input
        {...rest}
        className={clsx(
          "w-full rounded-md border border-gray-200 py-3 pl-4",
          icon ? "pr-10" : "pr-4",
          "placeholder:text-neutral-400 focus:border-neutral-600 focus:outline-none",
          className
        )}
      />
      {icon === "Search" ? (
        <Search className="absolute ml-3 right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-600" />
      ) : (
        icon
      )}
    </div>
  );
}