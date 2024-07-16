import { createLazyFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

export const Route = createLazyFileRoute("/")({
	component: Index,
});

const formSchema = z.object({
	recipients: z.array(z.string()),
	"new-recipient": z.string(),
});

async function fetchRecipients(): Promise<string[]> {
	const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/recipients`);

	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		throw APIError.fromResponse(res, errorData);
	}

	const recipients = (await res.json()) as Recipient[];

	return recipients.map((r) => r.email);
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

function Index() {
	const { data, isLoading, error } = useQuery({
		queryFn: fetchRecipients,
		queryKey: ["recipients"],
	});

	if (isLoading) return <Loading />;
	if (error) return <ErrorComponent error={error} />;
	if (!data) return <ErrorComponent error="No data available" />;

	return <RecipientsForm data={data} />;
}

function RecipientsForm(props: { data: string[] }) {
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			recipients: props.data,
			"new-recipient": "",
		},
	});

	const { mutate: addMutate } = useMutation<string[], APIError, string[]>({
		mutationFn: (emails: string[]) => addRecipients(emails),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipients"] }),
		onError: (error) => {
			console.log(error);
			toast.error("Failed to add email. Please try again.");
		},
	});

	const { mutate: removeMutate } = useMutation<string[], APIError, string>({
		mutationFn: (email: string) => removeRecipient(email),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipients"] }),
		onError: (error) => {
			console.log(error);
			toast.error("Failed to remove email. Please try again.");
		},
	});

	const handleClickAdd = () => {
		const values = form.getValues();
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

		form.setValue("recipients", [...existingRecipients, ...validNewEmails]);
		form.setValue("new-recipient", "");
	};

	const handleRemoveRecipient = (email: string) => {
		form.setValue(
			"recipients",
			form.getValues().recipients.filter((r) => r !== email),
		);

		removeMutate(email);
	};

	return (
		<Form {...form}>
			<form className="space-y-6">
				<h2 className="text-2xl font-bold">Newsletter Recipients</h2>
				<FormDescription>
					Add email addresses to send your newsletter to. You can add multiple email
					addresses by separating them with a comma.
				</FormDescription>

				<FormField
					control={form.control}
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
				<FormField
					control={form.control}
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
										<Button type="button" onClick={() => handleClickAdd()}>
											Add
										</Button>
									</div>
								</FormControl>
							</FormItem>
						);
					}}
				/>
			</form>
		</Form>
	);
}
