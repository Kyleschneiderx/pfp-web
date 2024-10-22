const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export default function Loading() {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="flex flex-wrap mt-6">
        <div className="mb-5 mr-5 w-[600px] h-[550px] rounded-lg bg-gray-200" />
        <div className="mb-5 mr-5 w-[350px] h-[400px] rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
