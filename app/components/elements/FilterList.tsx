import { ArrowDownUpIcon, ChevronDownIcon, FilterIcon } from "lucide-react";
import SearchCmp from "./SearchCmp";
import ResponsiveActionMenu from "./ResponsiveActionMenu";
import clsx from "clsx";

type Sort = {
	label: string;
	content: () => React.ReactNode;
};

type Filter = {
	label: string;
	content: () => React.ReactNode;
};

type FilterListProps = {
	onSearch?: (search: string) => void;
	searchWrapperClassName?: string;
	searchPlaceholder?: string;
	className?: string;
	sort?: Sort;
	sortWrapperClassName?: string;
	filter?: Filter;
	filterWrapperClassName?: string;
};

export default function FilterList({
	onSearch,
	searchPlaceholder,
	searchWrapperClassName,
	sort,
	filter,
	className,
	sortWrapperClassName,
	filterWrapperClassName,
}: FilterListProps) {
	return (
		<div className={clsx("flex flex-row items-center gap-x-2", className)}>
			<SearchCmp
				placeholder={searchPlaceholder ?? "Search"}
				onChange={onSearch ? onSearch : undefined}
				className={clsx(searchWrapperClassName)}
			/>
			{sort && (
				<ResponsiveActionMenu
					align="start"
					icon={
						<div
							className={clsx(
								"flex flex-row items-center cursor-pointer hover:text-neutral-900/70",
								sortWrapperClassName,
							)}
						>
							<div className="flex-row items-center hidden sm:flex">
								<span className="text-sm font-medium">{sort.label}</span>
								<ChevronDownIcon size={20} className="ml-1" />
							</div>
							<ArrowDownUpIcon size={20} className="sm-inline-block sm:hidden" />
						</div>
					}
					zIndex={30}
					content={() => sort.content()}
				/>
			)}
			{filter && (
				<ResponsiveActionMenu
					align="start"
					icon={
						<div
							className={clsx(
								"flex flex-row items-center cursor-pointer hover:text-neutral-900/70",
								filterWrapperClassName,
							)}
						>
							<div className="flex-row items-center hidden sm:flex">
								<span className="text-sm font-medium">{filter.label}</span>
								<ChevronDownIcon size={20} className="ml-1" />
							</div>
							<FilterIcon size={20} className="sm-inline-block sm:hidden" />
						</div>
					}
					content={() => filter.content()}
				/>
			)}
		</div>
	);
}
