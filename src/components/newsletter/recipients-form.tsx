import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Form,
	FormDescription,
	FormMessage,
} from "@/components/ui/form";
import { useAuthenticatedFetch } from "@/lib/auth";
import { Card } from "../ui/card";
import { APIError } from "@/lib/error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const recipientsFormSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(1, "First name is required")
		.max(50, "First name must be less than 50 characters"),
	lastName: z
		.string()
		.trim()
		.min(1, "First name is required")
		.max(50, "First name must be less than 50 characters"),
	email: z
		.string()
		.trim()
		.email({
			message: "Please enter a valid email address.",
		})
		.transform((value) => value.toLowerCase()),
});

export type RecipientsFormSchema = z.infer<typeof recipientsFormSchema>;

export default function RecipientsForm() {
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const form = useForm<z.infer<typeof recipientsFormSchema>>({
		resolver: zodResolver(recipientsFormSchema),
		defaultValues: {
			email: "",
			firstName: "",
			lastName: "",
		},
	});

	const mutation = useMutation({
		mutationFn: async (data: z.infer<typeof recipientsFormSchema>) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/recipients/add`,
				{
					method: "POST",
					body: JSON.stringify(data),
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return await res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["newsletters", "recipients"] });
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to add email. Please try again.");
		},
	});

	const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

	return (
		<Card className="p-6">
			<Form {...form}>
				<form className="container mx-auto space-y-4 px-0" onSubmit={onSubmit}>
					<div className="space-y-4">
						<h2 className="font-bold text-xl">Add New Recipient</h2>
						<FormDescription>
							Add contacts to the newsletter audience.
						</FormDescription>
					</div>
					<div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>First Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter the contact's first name..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="lastName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Last Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter the contact's last name..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input placeholder="Enter the contact's email..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full">
						Add Recipient
					</Button>
					<p className="text-red-500 text-sm">{mutation.error?.message}</p>
				</form>
			</Form>
		</Card>
	);
}
