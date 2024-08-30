interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Button({
  children,
  className,
  ...rest
}: InputFieldProps) {
  return (
    <div className="relative">
      <input
        {...rest}
        className="w-full rounded-md border border-gray-200 py-3 px-4 placeholder:text-gray-500"
      />
    </div>
  );
}
