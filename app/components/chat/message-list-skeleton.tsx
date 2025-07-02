export function MessageListSkeleton({ count = 5 }: { count: number }) {
	const own = [true, false];
	return (
		<div className="relative">
			<div className={"animate-pulse"}>
				{Array.from({ length: count }).map((_, index) => (
					<div key={index} className={`flex ${own[index % 2] ? "justify-end" : "justify-start"} mb-4`}>
						<div className="space-y-2">
							<div className={`h-10 ${own[index % 2] ? "w-48" : "w-40"} rounded-2xl bg-gray-200`} />
							<div className="h-3 w-12 ml-auto bg-gray-200" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
