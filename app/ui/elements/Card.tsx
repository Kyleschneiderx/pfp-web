import clsx from "clsx";

interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

export default function Card({ className, children }: CardProps) {
  return (
    <div
      className={clsx(
        "relative z-10 rounded-md bg-white p-10 drop-shadow-center",
        className
      )}
    >
      {children}
    </div>
  );
}
