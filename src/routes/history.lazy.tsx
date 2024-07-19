import ErrorComponent from "@/components/error";
import Loading from "@/components/loading";
import { withProtectedRoute } from "@/components/protected";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HoverableCell } from "@/components/ui/hover-card";
import { useAuthenticatedFetch } from "@/lib/auth";
import { APIError } from "@/lib/error";
import type { Newsletter } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

const ProtectedHistory = withProtectedRoute(History);
export const Route = createLazyFileRoute("/history")({
	component: ProtectedHistory,
});

function History() {
	const authenticatedFetch = useAuthenticatedFetch();

	const { data, isLoading, error } = useQuery({
		queryKey: ["newsletters"],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_BASE_URL}/api/newsletters`,
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			const newsletters = (await res.json()) as Newsletter[];

			return newsletters;
		},
	});

	if (isLoading) return <Loading />;
	if (error) return <ErrorComponent error={error} />;
	if (!data) return <ErrorComponent error="No data available" />;

	return <HistoryTable newsletters={data} />;
}

function HistoryTable(props: { newsletters: Newsletter[] }) {
	return (
		<div className="container mx-auto">
			<h2 className="text-2xl font-bold">History</h2>
			<DataTable columns={columns} data={props.newsletters} />
		</div>
	);
}

const columns: ColumnDef<Newsletter>[] = [
	{
		accessorKey: "id",
		header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
	},
	{
		accessorKey: "summary",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Summary" />
		),
		cell: ({ row }) => {
			return <HoverableCell value={row.original.summary} />;
		},
	},
	{
		accessorKey: "sendAt",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Send At" />
		),
		cell: ({ row }) => {
			const date = new Date(row.getValue<Date>("sendAt"));
			return date.toLocaleDateString();
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const newsletter = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(newsletter.id)}
						>
							Copy newsletter ID
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Link
								to={"/newsletters/$newsletterId"}
								params={{ newsletterId: newsletter.id }}
							>
								View Newsletter
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
