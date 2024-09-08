import clsx from "clsx";

interface Props {
  label1: string;
  label2: string;
  active: string;
  onToggle: (label: string) => void;
  className?: string;
}

const ToggleLabel = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={clsx(
      "py-[5px] px-4 rounded-full cursor-pointer",
      isActive ? "bg-primary-500 text-white" : "text-primary-500"
    )}
    onClick={onClick}
  >
    {label}
  </button>
);

export default function ToggleSwitch({
  label1,
  label2,
  active,
  onToggle,
  className,
}: Props) {
  return (
    <div
      className={clsx(
        "flex border rounded-full border-primary-500 text-xs",
        className
      )}
    >
      <ToggleLabel
        label={label1}
        isActive={active === label1}
        onClick={() => onToggle(label1)}
      />
      <ToggleLabel
        label={label2}
        isActive={active === label2}
        onClick={() => onToggle(label2)}
      />
    </div>
  );
}
