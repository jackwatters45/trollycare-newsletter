import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { APIError } from "@/lib/error";

export const Route = createFileRoute("/unsubscribe")({
	component: () => <Unsubscribe />,
});

const unsubscribeFormSchema = z.object({
	email: z
		.string()
		.trim()
		.email({
			message: "Please enter a valid email address.",
		})
		.transform((value) => value.toLowerCase()),
});

type UnsubscribeFormSchema = z.infer<typeof unsubscribeFormSchema>;

function Unsubscribe() {
	const form = useForm<UnsubscribeFormSchema>({
		resolver: zodResolver(unsubscribeFormSchema),
		defaultValues: {
			email: "",
		},
	});

	const mutation = useMutation({
		mutationFn: async (data: UnsubscribeFormSchema) => {
			const encodedEmail = encodeURIComponent(data.email);

			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/unsubscribe/${encodedEmail}`,
				{
					method: "DELETE",
					body: JSON.stringify(data),
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return res.json();
		},
	});

	const onSubmit = (values: UnsubscribeFormSchema) => {
		mutation.mutate(values);
	};

	return (
		<div className="container mx-auto p-4">
			<Card className=" mx-auto max-w-md">
				<CardHeader>
					<CardTitle className="text-xl">
						Unsubscribe from the TrollyCare Newsletter
					</CardTitle>
					<CardDescription>
						We're sorry to see you go. Please enter your email address below to
						unsubscribe from our newsletter.
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
						<Alert variant="success">
							<AlertTitle>Unsubscribe Successful!</AlertTitle>
							<AlertDescription>We're sorry to see you go!</AlertDescription>
						</Alert>
					)}
					{mutation.isError && (
						<div className="pt-4">
							<Alert variant="destructive">
								<AlertTitle>Unsubscribe Failed</AlertTitle>
								<AlertDescription>
									<p>
										An unknown error occurred and you could not be unsubscribed from the
										newsletter. We're very sorry about this. You can email us at
										hello@trollycare.com to have one our team members handle this for you.
									</p>
								</AlertDescription>
							</Alert>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
