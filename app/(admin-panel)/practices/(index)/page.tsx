import Button from "@/app/components/elements/Button";
import FilterList from "@/app/components/elements/FilterList";
import IconAddButton from "@/app/components/elements/mobile/IconAddButton";
import { getPracticeList } from "@/app/components/practices/actions";
import PracticeList from "@/app/components/practices/practice-list";
import { PAGE_ITEMS } from "@/app/lib/constants";
import type { List } from "@/app/models/global_model";
import type { Practice } from "@/app/models/practice";
import type { PracticessSearchQuery } from "@/app/services/server_side/practices";
import dynamic from "next/dynamic";
import Link from "next/link";

export default async function Page({
	searchParams,
}: {
	searchParams?: PracticessSearchQuery;
}) {
	let practices: List<Practice> | undefined;

	const displayNoRecord = (msg: string) => {
		return <p className="text-center mx-auto mt-[300px]">{msg}</p>;
	};

	try {
		practices = await getPracticeList({
			page: searchParams?.page ?? "1",
			page_items: searchParams?.page_items ?? `${PAGE_ITEMS}`,
			search: searchParams?.search || "",
			sort: "id:DESC",
		});
	} catch (error) {
		errorMessage = (error as Error).message;
	}

	console.log(practices?.data);

	return (
		<>
			<div className="flex items-center mb-8">
				<FilterList
					searchPlaceholder="Search practices"
					searchParam="search"
					searchValue={searchParams?.search}
					// onSearch={(string) => handleFilter("search", string)}
					// sort={{
					// 	label: "Sort",
					// 	content: () => {
					// 		return (
					// 			<div className="flex flex-col space-y-3 p-3 text-sm font-semibold">
					// 				<label className="flex items-center cursor-pointer">
					// 					<input
					// 						type="checkbox"
					// 						checked={filterRef.current.sort?.includes("starts_at:DESC") ?? true}
					// 						onChange={() => handleFilter("sort", ["starts_at:DESC"])}
					// 						className="mr-2 cursor-pointer"
					// 					/>
					// 					Upcoming
					// 				</label>
					// 				<label className="flex items-center cursor-pointer">
					// 					<input
					// 						type="checkbox"
					// 						checked={filterRef.current.sort?.includes("starts_at:ASC") ?? false}
					// 						onChange={() => handleFilter("sort", ["starts_at:ASC"])}
					// 						className="mr-2 cursor-pointer"
					// 					/>
					// 					Past
					// 				</label>
					// 			</div>
					// 		);
					// 	},
					// }}
					className="mr-4 sm:mr-0"
				/>
				{/* <SearchCmp placeholder="Search exercises" className="mr-4 sm:mr-0" />
				<ExerciseFilterSort /> */}
				<Link href="/practices/create" className="ml-auto">
					<Button label="Add Practice" showIcon className="hidden sm:flex" />
					<IconAddButton className="sm:hidden" />
				</Link>
			</div>
			<div>{practices?.data.length ? <PracticeList data={practices} /> : displayNoRecord("No reocords found")}</div>
		</>
	);
}
