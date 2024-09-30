import clsx from "clsx";

interface Props {
  label: string;
  className?: string;
}

export default function StatusBadge({ label, className }: Props) {
  return (
    <span
      className={clsx(
        "rounded-md py-[5px] px-[10px]",
        label === "Published"
          ? "text-success-600 bg-secondary-100"
          : "text-neutral-400 bg-slate-200",
        className
      )}
    >
      {label}
    </span>
  );
}
