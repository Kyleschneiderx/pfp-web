import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "flex justify-center items-center py-3 px-4 rounded-md bg-primary-500 text-white hover:bg-primary-300 active:bg-primary-500",
        className,
      )}
    >
      {children}
    </button>
  );
}
