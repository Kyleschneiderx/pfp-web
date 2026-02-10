"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
	page: number;
	maxPage: number;
	onPageChange: (page: number) => void;
	className?: string;
}

function getVisiblePages(page: number, maxPage: number): number[] {
	const delta = 2;
	const range: number[] = [];
	const rangeWithDots: number[] = [];
	let l: number | undefined;

	for (let i = 1; i <= maxPage; i++) {
		if (i === 1 || i === maxPage || (i >= page - delta && i <= page + delta)) {
			range.push(i);
		}
	}

	for (const i of range) {
		if (l !== undefined && i - l !== 1) {
			rangeWithDots.push(-1);
		}
		rangeWithDots.push(i);
		l = i;
	}

	return rangeWithDots;
}

export default function Pagination({ page, maxPage, onPageChange, className }: PaginationProps) {
	if (maxPage <= 1) return null;

	const visiblePages = getVisiblePages(page, maxPage);

	return (
		<nav className={clsx("flex items-center justify-center gap-1 sm:gap-2", className)} aria-label="Pagination">
			<button
				type="button"
				onClick={() => onPageChange(page - 1)}
				disabled={page <= 1}
				className={clsx(
					"p-2 rounded-md transition-colors",
					page <= 1
						? "text-neutral-300 cursor-default"
						: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
				)}
				aria-label="Previous page"
			>
				<ChevronLeft size={20} />
			</button>

			<div className="flex items-center gap-0.5 sm:gap-1">
				{visiblePages.map((p, idx) =>
					p === -1 ? (
						<span key={`ellipsis-${idx}`} className="px-1 sm:px-2 text-neutral-400">
							…
						</span>
					) : (
						<button
							key={p}
							type="button"
							onClick={() => onPageChange(p)}
							className={clsx(
								"min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors",
								p === page
									? "bg-primary-500 text-white"
									: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
							)}
						>
							{p}
						</button>
					),
				)}
			</div>

			<button
				type="button"
				onClick={() => onPageChange(page + 1)}
				disabled={page >= maxPage}
				className={clsx(
					"p-2 rounded-md transition-colors",
					page >= maxPage
						? "text-neutral-300 cursor-default"
						: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
				)}
				aria-label="Next page"
			>
				<ChevronRight size={20} />
			</button>
		</nav>
	);
}
