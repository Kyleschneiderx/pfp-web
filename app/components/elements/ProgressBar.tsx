interface Props {
  value: number;
}

export default function ProgressBar({ value }: Props) {
  return (
    <div className="relative w-full">
      <progress
        value={value}
        max={100}
        className="w-full h-4 rounded-lg appearance-none overflow-hidden [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:bg-success-600"
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800 -mt-[3px]">
        {value}%
      </div>
    </div>
  );
}
