import clsx from "clsx";
import { Search } from "lucide-react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  className?: string;
  invalid?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  icon,
  children,
  className,
  invalid = false,
  onChange,
  ...rest
}: Props) {
  return (
    <div className="relative">
      <input
        {...rest}
        className={clsx(
          "w-full rounded-md border py-[10px] pl-4 placeholder:text-neutral-400 placeholder:font-light focus:outline-none focus:border-primary-600",
          icon ? "pr-10" : "pr-4",
          invalid
            ? "border-error-400 focus:border-error-600 bg-error-25"
            : "border-gray-200 focus:border-neutral-600 ",
          className
        )}
        onChange={onChange}
      />
      {icon === "Search" ? (
        <Search className="absolute ml-3 right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-600" />
      ) : (
        icon
      )}
    </div>
  );
}
