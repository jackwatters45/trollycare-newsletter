import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useRef } from "react";
import Papa from "papaparse";

import { APIError } from "@/lib/error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Form,
	FormDescription,
} from "@/components/ui/form";
import { useAuthenticatedFetch } from "@/lib/auth";
import {
	AlertDialogDescription,
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "../ui/alert-dialog";
import { Card } from "../ui/card";

const recipientsFormSchema = z.object({
	recipients: z.array(z.string()),
	"new-recipient": z.string(),
});

export type RecipientsFormSchema = z.infer<typeof recipientsFormSchema>;

export default function RecipientsForm(props: {
	recipientEmails: string[];
	newsletterId?: string;
}) {
	const form = useForm<z.infer<typeof recipientsFormSchema>>({
		resolver: zodResolver(recipientsFormSchema),
		defaultValues: {
			recipients: props.recipientEmails,
			"new-recipient": "",
		},
	});

	return (
		<Card className="p-6">
			<Form {...form}>
				<form className="space-y-8 container px-0 mx-auto">
					<div className="space-y-6">
						<h2 className="text-2xl font-bold">Newsletter Recipients</h2>
						<FormDescription>
							Add email addresses to send your newsletter to. You can add multiple
							email addresses by separating them with a comma. This will change the
							recipients for all-non sent newsletters.
						</FormDescription>
					</div>
					<div className="space-y-4">
						<div className="flex justify-end items-center space-x-2">
							<CSVUpload form={form} newsletterId={props.newsletterId} />
							<RemoveAllRecipients form={form} newsletterId={props.newsletterId} />
						</div>
						<NewRecipientInput form={form} newsletterId={props.newsletterId} />
						<RecipientsInput form={form} newsletterId={props.newsletterId} />
					</div>
				</form>
			</Form>
		</Card>
	);
}

interface RecipientsFormInputProps {
	form: UseFormReturn<RecipientsFormSchema>;
	newsletterId?: string;
}

export function CSVUpload(props: RecipientsFormInputProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const addRecipientsMutation = useMutation<string[], APIError, string[]>({
		mutationFn: async (emails: string[]) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/recipients/bulk`,
				{
					method: "POST",
					body: JSON.stringify({ emails }),
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		onSuccess: (addedEmails) => {
			queryClient.invalidateQueries({ queryKey: ["recipients"] });
			console.log(props.newsletterId);
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
			const currentRecipients = props.form.getValues().recipients;
			const newRecipients = [...new Set([...currentRecipients, ...addedEmails])];
			props.form.setValue("recipients", newRecipients);
			toast.success(`Added ${addedEmails.length} new recipient(s)`);
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to add recipients. Please try again.");
		},
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			Papa.parse(file, {
				complete: (results: Papa.ParseResult<string[]>) => {
					const emails = results.data
						.flat()
						.filter((email: string) => email.includes("@"));

					addRecipientsMutation.mutate(emails);
				},
				error: (error) => {
					console.error("Error parsing CSV:", error);
					toast.error("Failed to parse CSV file. Please check the file format.");
				},
			});
		}
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept=".csv"
				className="hidden"
			/>
			<Button
				type="button"
				size="xs"
				variant="secondary"
				className="text-xs"
				onClick={handleButtonClick}
				disabled={addRecipientsMutation.isPending}
			>
				{addRecipientsMutation.isPending ? "Uploading..." : "Upload CSV"}
			</Button>
		</div>
	);
}

function RemoveAllRecipients(props: RecipientsFormInputProps) {
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const mutation = useMutation({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/recipients/all`,
				{
					method: "DELETE",
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw new Error(errorData?.message);
			}

			return await res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recipients"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
			props.form.setValue("recipients", []);
			toast.success("Removed all recipients");
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to remove email. Please try again.");
		},
	});

	const onConfirm = () => mutation.mutate();

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					type="button"
					size={"xs"}
					variant={"destructive"}
					className="text-xs"
					disabled={mutation.isPending}
				>
					Remove All Recipients
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to remove all recipients?
					</AlertDialogTitle>
					<AlertDialogDescription>
						Please confirm that you want to remove all recipients from the newsletter.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function RecipientsInput(props: RecipientsFormInputProps) {
	const queryClient = useQueryClient();

	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate: removeMutate } = useMutation<string[], APIError, string>({
		mutationFn: async (email: string) => {
			const escapedEmail = encodeURIComponent(email);
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/recipients/${escapedEmail}`,
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
			queryClient.invalidateQueries({ queryKey: ["recipients"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to remove email. Please try again.");
		},
	});

	const handleRemoveRecipient = (email: string) => {
		props.form.setValue(
			"recipients",
			props.form.getValues().recipients.filter((r) => r !== email),
		);

		removeMutate(email);
	};

	return (
		<FormField
			control={props.form.control}
			name="recipients"
			render={({ field }) => {
				return (
					<FormItem>
						<FormLabel className="sr-only">Newsletter Recipients</FormLabel>
						<FormControl>
							<div className="flex items-center flex-wrap gap-1">
								{field.value.map((email) => (
									<Badge key={email} className="hover:bg-primary">
										{email}
										<Button
											type="button"
											onClick={() => handleRemoveRecipient(email)}
											className="ml-1 -mr-1 p-1 rounded-full h-5 hover:bg-accent/20 hover:text-primary-foreground"
											variant="ghost"
										>
											<X className={" h-3 w-3"} />
										</Button>
									</Badge>
								))}
							</div>
						</FormControl>
					</FormItem>
				);
			}}
		/>
	);
}

const emailSchema = z.string().email("Invalid email address");

function NewRecipientInput(props: RecipientsFormInputProps) {
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate: addMutate } = useMutation<string[], APIError, string[]>({
		mutationFn: async (emails: string[]) => {
			const results = await Promise.all(
				emails.map(async (email) => {
					const escapedEmail = encodeURIComponent(email.trim());
					const res = await authenticatedFetch(
						`${import.meta.env.VITE_API_URL}/api/recipients/${escapedEmail}`,
						{
							method: "POST",
						},
					);

					if (!res.ok) {
						const errorData = await res.json().catch(() => null);
						throw APIError.fromResponse(res, errorData);
					}
					return await res.json();
				}),
			);
			return results;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recipients"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to add email. Please try again.");
		},
	});

	const handleClickAdd = (
		e:
			| React.MouseEvent<HTMLButtonElement>
			| React.KeyboardEvent<HTMLInputElement>,
	) => {
		e.preventDefault();

		const values = props.form.getValues();
		const newRecipientInput = values["new-recipient"];
		const existingRecipients = values.recipients;

		if (!newRecipientInput) return false;

		const newEmails = newRecipientInput.split(",").map((email) => email.trim());
		const validNewEmails = newEmails.filter((email) => {
			const validationResult = emailSchema.safeParse(email);
			if (!validationResult.success) {
				toast.error(`Invalid email: ${email}`);
				return false;
			}
			return !existingRecipients.includes(email);
		});

		if (validNewEmails.length === 0) {
			return false;
		}

		addMutate(validNewEmails);

		props.form.setValue("recipients", [...existingRecipients, ...validNewEmails]);
		props.form.setValue("new-recipient", "");
	};

	return (
		<FormField
			control={props.form.control}
			name="new-recipient"
			render={({ field }) => {
				return (
					<FormItem>
						<FormLabel className="sr-only">New Recipient</FormLabel>
						<FormControl>
							<div className="flex items-center">
								<Input
									type="email"
									value={field.value}
									onChange={field.onChange}
									placeholder="Enter email address"
									className="flex-grow"
									onKeyDown={(e) => {
										if (e.key === "Enter") handleClickAdd(e);
									}}
								/>
								<Button type="button" onClick={handleClickAdd}>
									Add
								</Button>
							</div>
						</FormControl>
					</FormItem>
				);
			}}
		/>
	);
}
