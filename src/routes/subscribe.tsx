import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormDescription,
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

export const Route = createFileRoute("/subscribe")({
	component: Subscribe,
});

const formSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
});

function Subscribe() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const mutation = useMutation({
		mutationFn: async (email: string) => {
			const encodedEmail = encodeURIComponent(email);
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/subscribe/${encodedEmail}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Subscription failed");
			}

			return response.json();
		},
		onSuccess: () => {
			setTimeout(() => {
				window.location.href = "https://www.trollycare.com/";
			}, 2500);
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		mutation.mutate(values.email);
	};

	return (
		<div className="container mx-auto p-4">
			<Card className="max-w-md mx-auto">
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
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input placeholder="your.email@example.com" {...field} />
											</FormControl>
											<FormDescription>
												We'll never share your email with anyone else.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" disabled={mutation.isPending}>
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
								Thank you for subscribing to our newsletter. You'll receive our next issue soon! You will now be redirected to our website.
							</AlertDescription>
						</Alert>
					)}
					{mutation.isError && (
						<div className="pt-4">
							<Alert variant="destructive">
								<AlertTitle>Subscription Failed</AlertTitle>
								<AlertDescription>{mutation.error.message}</AlertDescription>
							</Alert>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
