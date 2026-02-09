const shimmer =
	"before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

function Skeleton({ className }: { className?: string }) {
	return (
		<div className={`${shimmer} relative overflow-hidden rounded-md bg-neutral-200 ${className ?? ""}`} />
	);
}

export function FormBuilderFormSkeleton() {
	return (
		<div className={`${shimmer} relative flex flex-col h-full min-h-0 overflow-hidden`}>
			<header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-neutral-200 bg-white shrink-0">
				<div className="flex items-center gap-3 min-w-0">
					<Skeleton className="h-10 w-10 rounded-md shrink-0" />
					<Skeleton className="h-6 w-32" />
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<Skeleton className="h-10 w-20 rounded-md hidden sm:block" />
					<Skeleton className="h-10 w-20 rounded-md hidden sm:block" />
					<Skeleton className="h-10 w-16 rounded-md hidden sm:block" />
				</div>
			</header>

			<div className="flex-1 overflow-auto">
				<div className="mx-auto w-full max-w-4xl px-6 py-8">
					<div className="space-y-8">
						<div className="border border-neutral-200 rounded-lg bg-white p-6 sm:p-8">
							<Skeleton className="h-4 w-28 mb-4" />
							<div className="grid gap-6 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<Skeleton className="h-4 w-16 mb-2" />
									<Skeleton className="h-10 w-full" />
								</div>
							</div>
						</div>

						<div className="border border-neutral-200 rounded-lg bg-white p-6 sm:p-8">
							<Skeleton className="h-4 w-24 mb-6" />
							<div className="space-y-4">
								{Array.from({ length: 3 }).map((_, i) => (
									<div key={i} className="border border-neutral-200 rounded-lg p-5">
										<div className="flex items-start gap-4">
											<Skeleton className="h-5 w-5 shrink-0 mt-0.5" />
											<div className="flex-1 space-y-4">
												<div className="flex items-center gap-3">
													<Skeleton className="h-10 w-[140px] max-w-[200px]" />
													<Skeleton className="h-4 w-16" />
												</div>
												<Skeleton className="h-10 w-full" />
											</div>
										</div>
									</div>
								))}
							</div>
							<div className="flex flex-col items-center justify-center py-10 mt-4 border-2 border-dashed border-neutral-200 rounded-lg">
								<Skeleton className="h-8 w-8 rounded-full mb-2" />
								<Skeleton className="h-4 w-28 mb-1" />
								<Skeleton className="h-3 w-48" />
							</div>
						</div>
					</div>
				</div>
			</div>

			<footer className="sm:hidden flex flex-col gap-2 p-4 bg-white border-t border-neutral-200 shrink-0">
				<Skeleton className="h-10 w-full rounded-md" />
				<Skeleton className="h-10 w-full rounded-md" />
			</footer>
		</div>
	);
}
