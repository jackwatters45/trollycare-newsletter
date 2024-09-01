import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useEffect } from "react";

export const Route = createFileRoute("/unsubscribe")({
	component: () => <Unsubscribe />,
	validateSearch: z.object({
		email: z.string().nullish(),
	}),
});

function Unsubscribe() {
	const { email } = Route.useSearch();

	const mutation = useMutation({
		mutationFn: async (email: string) => {
			const encodedEmail = encodeURIComponent(email);
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/unsubscribe/${encodedEmail}`,
				{ method: "DELETE" },
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unsubscribe failed");
			}

			return response.json();
		},
	});

	useEffect(() => {
		if (email) mutation.mutate(email);
	}, [email, mutation.mutate]);

	if (!email) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					No email provided. Unable to process unsubscribe request.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<Card className="max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Unsubscribe from Our Newsletter</CardTitle>
					<CardDescription>We're processing your request.</CardDescription>
				</CardHeader>
				<CardContent>
					{mutation.isPending ? (
						<div className="flex flex-col items-center">
							<Loader2 className="h-8 w-8 animate-spin mb-4" />
							<p>Unsubscribing {email} from our newsletter...</p>
						</div>
					) : mutation.isSuccess ? (
						<Alert>
							<AlertDescription>
								You have been successfully unsubscribed. We're sorry to see you go!
							</AlertDescription>
						</Alert>
					) : mutation.isError ? (
						<Alert variant="destructive">
							<AlertDescription>
								{mutation.error.message}. Please try again or contact support if the
								problem persists.
							</AlertDescription>
						</Alert>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
