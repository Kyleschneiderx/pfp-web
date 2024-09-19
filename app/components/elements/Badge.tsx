import clsx from "clsx";

interface Props {
  label: string;
  className?: string;
}

export default function Badge({ label, className }: Props) {
  return (
    <span
      className={clsx(
        "mr-3 bg-neutral-200 py-[5px] px-[10px] text-xs font-medium rounded-full",
        className
      )}
    >
      {label}
    </span>
  );
}
