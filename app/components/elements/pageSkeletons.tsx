const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export function PageSkeletons() {
  const CardSkeleton = () => (
    <div className="mb-5 mr-5 w-[350px] h-[200px] rounded-lg bg-gray-200" />
  );

  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className="flex">
        <div className="mb-4 h-10 w-[550px] rounded-md bg-gray-200" />
        <div className="ml-auto h-10 w-[200px] rounded-md bg-gray-200" />
      </div>
      <div className="flex flex-wrap mt-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
