import clsx from "clsx";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export default function Textarea({ className, ...rest }: Props) {
  return (
    <div className="relative">
      <textarea
        {...rest}
        className={clsx(
          "w-full rounded-md border border-gray-200 py-[10px] p-4 placeholder:text-neutral-400 placeholder:font-light focus:border-neutral-600 focus:outline-none",
          className
        )}
      />
    </div>
  );
}
