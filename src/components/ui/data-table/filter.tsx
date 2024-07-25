import type { Table } from "@tanstack/react-table";
import { Input } from "../input";

interface DataTableFilterProps<TData> {
	table: Table<TData>;
}

export default function DataTableFilter<TData>({
	table,
}: DataTableFilterProps<TData>) {
	return (
		<Input
			placeholder="Search all fields..."
			className="my-4 px-2"
			id="search"
			name="search"
			value={table.getState().globalFilter ?? ""}
			onChange={(event) => table.setGlobalFilter(event.target.value)}
		/>
	);
}

// This function should be defined outside of the component and passed to the table instance
export function globalFilterFn(
	// biome-ignore lint/suspicious/noExplicitAny: <blah blah>
	row: any,
	_columnId: string,
	filterValue: string,
): boolean {
	const search = filterValue.toLowerCase();
	return Object.values(row.original).some((value) =>
		String(value).toLowerCase().includes(search),
	);
}
