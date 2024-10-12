import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/column-header";
import type { ColumnDef } from "@tanstack/react-table";
import type { Recipient } from "@/types";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/lib/auth";
import { APIError } from "@/lib/error";
import { useMemo } from "react";

export default function RecipientsTable(props: { recipients: Recipient[] }) {
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate: deleteRecipient } = useMutation({
		mutationFn: async (id: string) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/recipients/${id}`,
				{
					method: "DELETE",
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return await res.json();
		},
		onSuccess: () => {
			toast.success("Recipient deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["newsletters", "recipients"] });
		},
		onError: (error) => {
			toast.error(
				`Failed to delete recipient. ${error.message ?? "Please try again."}`,
			);
		},
	});

	const { mutate: toggleSubscription } = useMutation({
		mutationFn: async ({
			id,
			action,
		}: { id: string; action: "subscribe" | "unsubscribe" }) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/recipients/${id}/${action}`,
				{
					method: "PATCH",
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return await res.json();
		},
		onSuccess: (_, variables) => {
			const action =
				variables.action === "subscribe" ? "subscribed" : "unsubscribed";
			toast.success(`Recipient ${action} successfully`);
			queryClient.invalidateQueries({ queryKey: ["newsletters", "recipients"] });
		},
		onError: (error, variables) => {
			const action =
				variables.action === "subscribe" ? "subscribe" : "unsubscribe";
			toast.error(
				`Failed to ${action} recipient. ${error.message ?? "Please try again."}`,
			);
		},
	});

	const columns = useMemo<ColumnDef<Recipient>[]>(
		() => [
			{
				accessorKey: "fullName",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="User Name" />
				),
			},
			{
				accessorKey: "email",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Email" />
				),
			},
			{
				accessorKey: "status",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
			},
			{
				id: "actions",
				cell: ({ row }) => {
					const recipient = row.original;
					const isSubscribed = recipient.status === "ACTIVE";

					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem asChild>
									<a href="https://us14.admin.mailchimp.com/audience/contact-profile?contact_id=0b92ba0f5e1eed6961d3a60eabe828e2&use_segment=N&page=1&pageSize=10&sort=timestamp_opt&asc=desc">
										Open Contact in MailChimp
									</a>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => {
										navigator.clipboard.writeText(recipient.contactId);
										toast.success(
											`Contact ID: ${recipient.contactId} copied to clipboard`,
										);
									}}
								>
									Copy Account Name
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										navigator.clipboard.writeText(recipient.email);
										toast.success(
											`Recipient email: ${recipient.email} copied to clipboard`,
										);
									}}
								>
									Copy Email
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className={isSubscribed ? "focus:bg-red-100" : ""}
									onClick={() =>
										toggleSubscription({
											id: recipient.id,
											action: isSubscribed ? "unsubscribe" : "subscribe",
										})
									}
								>
									{isSubscribed ? "Unsubscribe" : "Subscribe"} Recipient
								</DropdownMenuItem>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="ghost"
											className="h-8 w-full flex-1 items-center justify-start rounded-sm px-2 py-1/.5 font-normal text-popover-foreground text-sm outline-none transition-colors hover:bg-red-100 hover:text-accent-foreground"
										>
											Delete Recipient
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												Are you sure you want to permanently delete this recipient?
											</AlertDialogTitle>
											<AlertDialogDescription>
												Please confirm that you want to permanently delete this member from
												the newsletter and the MailChimp list.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction onClick={() => deleteRecipient(recipient.id)}>
												Confirm
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[toggleSubscription, deleteRecipient],
	);

	return <DataTable columns={columns} data={props.recipients} />;
}
