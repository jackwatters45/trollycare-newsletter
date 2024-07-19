import type { Table } from "@tanstack/react-table";
import { Input } from "../input";

interface DataTableFilterProps<TData> {
	table: Table<TData>;
}

// TODO: seach all fields (even hidden) + non searchable fields
export default function DataTableFilter<TData>({
	table,
}: DataTableFilterProps<TData>) {
	return (
		<Input
			placeholder="Search..."
			className="my-4 px-2 "
			value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
			onChange={(event) =>
				table.getColumn("name")?.setFilterValue(event.target.value)
			}
		/>
	);
}
