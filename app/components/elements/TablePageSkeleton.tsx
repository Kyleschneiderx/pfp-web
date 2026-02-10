const shimmer =
	"before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

function Skeleton({ className }: { className?: string }) {
	return (
		<div className={`${shimmer} relative overflow-hidden rounded-md bg-neutral-200 ${className ?? ""}`} />
	);
}

export function TablePageSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div className="flex flex-col gap-2">
					<Skeleton className="h-6 w-20" />
					<Skeleton className="h-4 max-w-[700px] w-full" />
					<Skeleton className="h-4 max-w-[500px] w-3/4" />
				</div>
				<Skeleton className="h-10 w-full sm:w-28" />
			</div>

			<div className="border border-neutral-200 rounded-lg overflow-hidden">
				<div className="flex items-center gap-2 p-3 sm:px-4 border-b border-neutral-200 bg-neutral-50/50">
					<Skeleton className="h-9 flex-1 max-w-sm" />
				</div>
				<div className="divide-y divide-neutral-100">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="flex items-center gap-2 py-3 px-2 sm:px-4">
							<Skeleton className="h-5 flex-1 max-w-[40%]" />
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 w-24 hidden sm:block" />
							<Skeleton className="h-8 w-8 rounded-full shrink-0" />
						</div>
					))}
				</div>
				<div className="flex items-center justify-center gap-1 sm:gap-2 py-3 border-t border-neutral-200">
					<Skeleton className="h-9 w-9 rounded-md" />
					<Skeleton className="h-9 w-9 rounded-md" />
					<Skeleton className="h-9 w-16 rounded-md" />
					<Skeleton className="h-9 w-9 rounded-md" />
					<Skeleton className="h-9 w-9 rounded-md" />
				</div>
			</div>
		</div>
	);
}
