import clsx from "clsx";
import { ChevronDown } from "lucide-react";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children?: React.ReactNode;
}

export default function Select({ className, children, ...rest }: Props) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={clsx(
          "w-full rounded-md border border-gray-200 py-[10px] p-3 pr-9 appearance-none focus:border-neutral-600 focus:outline-none",
          className
        )}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none" />
    </div>
  );
}
