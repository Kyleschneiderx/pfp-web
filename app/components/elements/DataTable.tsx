import clsx from "clsx";

export interface Column<T> {
	header: string;
	accessor: keyof T | ((row: T) => React.ReactNode);
	className?: string;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	getRowKey: (row: T, index: number) => string | number;
	emptyValue?: string;
	className?: string;
	size?: "sm" | "md";
}

const cellPadding = {
	sm: "py-2 px-3",
	md: "py-3 px-2 sm:px-4",
};

export default function DataTable<T extends object>({
	columns,
	data,
	getRowKey,
	emptyValue = "—",
	className,
	size = "sm",
}: DataTableProps<T>) {
	const padding = cellPadding[size];

	const getCellValue = (row: T, column: Column<T>): React.ReactNode => {
		if (typeof column.accessor === "function") {
			return column.accessor(row);
		}
		const value = (row as Record<string, unknown>)[column.accessor as string];
		if (value === undefined || value === null || value === "") {
			return emptyValue;
		}
		if (typeof value === "boolean") {
			return value ? "Yes" : emptyValue;
		}
		return String(value);
	};

	return (
		<div className={clsx("overflow-x-auto text-sm", className)}>
			<table className="w-full">
				<thead>
					<tr className="border-b border-neutral-200">
						{columns.map((col) => (
							<th
								key={col.header}
								className={clsx(
									"text-left font-medium text-neutral-600",
									padding,
									col.className,
								)}
							>
								{col.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map((row, index) => (
						<tr
							key={getRowKey(row, index)}
							className="border-b border-neutral-100 last:border-0"
						>
							{columns.map((col) => (
								<td
									key={col.header}
									className={clsx(padding, col.className)}
								>
									{getCellValue(row, col)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
