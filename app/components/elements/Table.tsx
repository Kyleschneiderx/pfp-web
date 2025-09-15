import { MoreHorizontalIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./DropdownMenu";
import Link from "next/link";

interface Props {
	data?: string[];
}

export default function Table({ data }: Props) {
	const tableData = [
		{
			id: 1,
			name: "Schedule 1",
			link: "https://example.com/provider-name/schdule-1",
			incoming_meetinngs: 1,
			status: "Published",
			updated_at: "2024-01-15",
			availability: "Availability 1",
		},
		{
			id: 2,
			name: "Schdule 2",
			link: "https://example.com/provider-name/schdule-1",
			incoming_meetinngs: 2,
			status: "Published",
			updated_at: "2024-02-20",
			availability: "Availability 2",
		},
		{
			id: 3,
			name: "Schdule 3",
			link: "https://example.com/provider-name/schdule-1",
			incoming_meetinngs: 0,
			status: "Draft",
			updated_at: "2024-03-10",
			availability: "Availability 3",
		},
		{
			id: 4,
			name: "Schedule 4",
			link: "https://example.com/provider-name/schdule-1",
			incoming_meetinngs: 4,
			status: "Published",
			updated_at: "2024-03-25",
			availability: "Availability 4",
		},
		{
			id: 5,
			name: "Schdule 5",
			link: "https://example.com/provider-name/schdule-1",
			incoming_meetinngs: 5,
			status: "Published",
			updated_at: "2024-01-05",
			availability: "Availability 5",
		},
	];

	return (
		<div className="w-full text-sm">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-border">
							<th className="text-left py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">Name</th>
							<th className="text-left py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
								Link
							</th>
							<th className="text-left py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">
								Incoming Meetings
							</th>
							<th className="text-left py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm hidden md:table-cell">
								Availability
							</th>
							<th className="text-left py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">
								Status
							</th>
							<th className="text-left py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">
								Date Modified
							</th>
							<th className="text-right py-3 px-2 sm:px-4 font-medium text-muted-foreground text-xs sm:text-sm">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{tableData.map((item) => (
							<tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
								<td className="py-3 px-2 sm:px-4">
									<div className="font-medium text-sm">{item.name}</div>
									<div className="text-xs text-muted-foreground sm:hidden">
										<Link href={item.link}>{item.link}</Link>
									</div>
								</td>
								<td className="py-3 px-2 sm:px-4 text-muted-foreground text-sm hidden sm:table-cell">
									<Link href={item.link}>{item.link}</Link>
								</td>
								<td className="py-3 px-2 sm:px-4 text-sm">
									<div>{item.incoming_meetinngs}</div>
									<div className="text-xs text-muted-foreground md:hidden">{item.availability}</div>
								</td>
								<td className="py-3 px-2 sm:px-4 text-sm hidden md:table-cell">{item.availability}</td>
								<td className="py-3 px-2 sm:px-4">
									{item.status}
									<div className="text-xs text-muted-foreground lg:hidden mt-1">{item.updated_at}</div>
								</td>
								<td className="py-3 px-2 sm:px-4 text-muted-foreground text-sm hidden lg:table-cell">
									{item.updated_at}
								</td>
								<td className="py-3 px-2 sm:px-4 text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button type="button">
												<MoreHorizontalIcon className="h-4 w-4" />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>View</DropdownMenuItem>
											<DropdownMenuItem>Edit</DropdownMenuItem>
											<DropdownMenuItem>Delete</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
