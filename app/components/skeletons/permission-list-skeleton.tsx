export function PermissionListSkeleton({ count = 5 }: { count?: number }) {
	return (
		<div className="relative">
			<div className={"animate-pulse divide-y divide-gray-100"}>
				{Array.from({ length: count }).map((_, index) => (
					<div key={index} className={"flex items-center p-3 space-x-3"}>
						<div className="flex-1 space-y-2">
							<div className="flex items-center justify-between">
								<div className="h-4 w-24 bg-gray-200" />
								<div className="h-3 w-8 bg-gray-200" />
							</div>
							<div className="h-3 w-32 bg-gray-200" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
