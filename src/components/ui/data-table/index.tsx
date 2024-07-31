"use client";

import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";

import React from "react";

import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	TableOptions,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./pagination";
import DataTableFilter, { globalFilterFn } from "./filter";
import { cn } from "@/lib/utils";

interface DataTableProps<TData extends { id: string }, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	options?: TableOptions<TData>;
}

export function DataTable<TData extends { id: string }, TValue>({
	columns,
	data,
	options,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	console.log(sorting)

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getRowId: (row) => row.id,
		globalFilterFn,
		state: {
			sorting,
			columnFilters,
		},
		...options,
	});

	return (
		<div>
			<DataTableFilter table={table} />
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header, i) => {
								return (
									<TableHead
										key={header.id}
										className={cn("", i === 0 ? "pl-8" : "pl-0")}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
								className="group"
							>
								{row.getVisibleCells().map((cell, i) => (
									<TableCell key={cell.id} className={cn("", i === 0 ? "pl-8" : "pl-0")}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<DataTablePagination table={table} />
		</div>
	);
}
