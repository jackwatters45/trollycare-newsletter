import { createLazyFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";

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
import Loading from "@/components/loading";
import ErrorComponent from "@/components/error";
import type { Recipient } from "@/types";
import { withProtectedRoute } from "@/components/protected";
import { useAuthenticatedFetch } from "@/lib/auth";

// TODO: handle protected without redirect instead of error
const ProtectedIndex = withProtectedRoute(Index);
export const Route = createLazyFileRoute("/")({
	// component: ProtectedIndex,
	component: Index,
});

const formSchema = z.object({
	recipients: z.array(z.string()),
	"new-recipient": z.string(),
});

function Index() {
	const authenticatedFetch = useAuthenticatedFetch();

	const { data, isLoading, error } = useQuery({
		queryKey: ["recipients"],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_BASE_URL}/api/recipients`,
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			const recipients = (await res.json()) as Recipient[];

			return recipients.map((r) => r.email);
		},
	});

	if (isLoading) return <Loading />;
	if (error) return <ErrorComponent error={error} />;
	if (!data) return <ErrorComponent error="No data available" />;

	return <RecipientsForm data={data} />;
}

function RecipientsForm(props: { data: string[] }) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			recipients: props.data,
			"new-recipient": "",
		},
	});

	return (
		<Form {...form}>
			<form className="space-y-6">
				<h2 className="text-2xl font-bold">Newsletter Recipients</h2>
				<FormDescription>
					Add email addresses to send your newsletter to. You can add multiple email
					addresses by separating them with a comma.
				</FormDescription>
				<NewRecipientInput form={form} />
				<RecipientsInput form={form} />
			</form>
		</Form>
	);
}

async function removeRecipient(email: string) {
	const escapedEmail = encodeURIComponent(email);
	const res = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/recipients/${escapedEmail}`,
		{
			method: "DELETE",
		},
	);

	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		throw APIError.fromResponse(res, errorData);
	}
	return await res.json();
}

function RecipientsInput(props: {
	form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
	const queryClient = useQueryClient();

	const { mutate: removeMutate } = useMutation<string[], APIError, string>({
		mutationFn: (email: string) => removeRecipient(email),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipients"] }),
		onError: (error) => {
			console.log(error);
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
							<div className="flex items-center gap-1">
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

async function addRecipients(emails: string[]) {
	const results = await Promise.all(
		emails.map(async (email) => {
			const escapedEmail = encodeURIComponent(email.trim());
			const res = await fetch(
				`${import.meta.env.VITE_BASE_URL}/api/recipients/${escapedEmail}`,
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
}

function NewRecipientInput(props: {
	form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
	const queryClient = useQueryClient();

	const { mutate: addMutate } = useMutation<string[], APIError, string[]>({
		mutationFn: (emails: string[]) => addRecipients(emails),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipients"] }),
		onError: (error) => {
			console.log(error);
			toast.error("Failed to add email. Please try again.");
		},
	});

	const handleClickAdd = () => {
		const values = props.form.getValues();
		const newRecipientInput = values["new-recipient"];
		const existingRecipients = values.recipients;

		if (!newRecipientInput) {
			return false;
		}

		const newEmails = newRecipientInput.split(",").map((email) => email.trim());
		const validNewEmails = newEmails.filter(
			(email) => email && !existingRecipients.includes(email),
		);

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
