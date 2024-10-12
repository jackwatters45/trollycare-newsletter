import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { APIError } from "@/lib/error";

export const Route = createFileRoute("/subscribe")({
	component: Subscribe,
});

const subscribeFormSchema = z.object({
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

type SubscribeFormSchema = z.infer<typeof subscribeFormSchema>;

function Subscribe() {
	const form = useForm<SubscribeFormSchema>({
		resolver: zodResolver(subscribeFormSchema),
		defaultValues: {
			email: "",
			firstName: "",
			lastName: "",
		},
	});

	const mutation = useMutation({
		mutationFn: async (data: SubscribeFormSchema) => {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribe/`, {
				method: "POST",
				body: JSON.stringify(data),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return res.json();
		},
		onSuccess: () => {
			setTimeout(() => {
				window.location.href = "https://www.trollycare.com/";
			}, 2500);
		},
	});

	const onSubmit = (values: SubscribeFormSchema) => {
		mutation.mutate(values);
	};

	return (
		<div className="container mx-auto p-4">
			<Card className=" mx-auto max-w-md">
				<CardHeader>
					<CardTitle className="text-xl">
						Subscribe to the TrollyCare Newsletter
					</CardTitle>
					<CardDescription>
						Stay updated with the latest homecare news and insights!
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!mutation.isSuccess && (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First Name</FormLabel>
											<FormControl>
												<Input
													autoComplete="given-name"
													placeholder="Enter your first name..."
													{...field}
												/>
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
												<Input
													autoComplete="family-name"
													placeholder="Enter your last name..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													autoComplete="email"
													placeholder="Enter your email..."
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" disabled={mutation.isPending} className="w-full">
									{mutation.isPending && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Subscribe
								</Button>
							</form>
						</Form>
					)}
					{mutation.isSuccess && (
						<Alert variant="default">
							<AlertTitle>Subscription Successful!</AlertTitle>
							<AlertDescription>
								Thank you for subscribing to our newsletter. You'll receive our next
								issue soon! You will now be redirected to our website.
							</AlertDescription>
						</Alert>
					)}
					{mutation.isError && (
						<div className="pt-4">
							<Alert variant="destructive">
								<AlertTitle>Subscription Failed</AlertTitle>
								<AlertDescription>{`Message: ${mutation.error.message}`}</AlertDescription>
							</Alert>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
