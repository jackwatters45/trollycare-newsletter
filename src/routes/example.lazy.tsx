import { useAuthenticatedFetch } from "@/lib/auth";
import { APIError } from "@/lib/error";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import type { Newsletter } from "@/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { withProtectedRoute } from "@/components/protected";
import Loading from "@/components/loading";
import ErrorComponent from "@/components/error";

const ProtectedSecretTest = withProtectedRoute(SecretTest);
export const Route = createLazyFileRoute("/example")({
	component: ProtectedSecretTest,
});

interface ReviewNewsletterResponse {
	newsletter: Newsletter;
}

function SecretTest() {
	const authenticatedFetch = useAuthenticatedFetch();

	const { data, isLoading, error } = useQuery({
		queryKey: ["newsletters"],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/unsent`,
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			const newsletters = (await res.json()) as Newsletter[];

			return newsletters;
		},
	});

	const fullMutation = useMutation<ReviewNewsletterResponse>({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/review`,
				{
					method: "POST",
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			const newsletter = await res.json();

			return newsletter;
		},
		onError: (error) => {
			console.error("An error occurred:", error);
		},
	});
	const handleFullGenerate = () => fullMutation.mutate();

	const emailMutation = useMutation<ReviewNewsletterResponse>({
		mutationFn: async () => {
			if (!data) return;
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/${data[0].id}/review`,
				{
					method: "POST",
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			const newsletter = await res.json();

			return newsletter;
		},
		onError: (error) => {
			console.error("An error occurred:", error);
		},
	});
	const handleSimulateEmail = () => emailMutation.mutate();

	if (isLoading) return <Loading />;
	if (error) return <ErrorComponent error={error} />;
	if (!data) return <ErrorComponent error="No data available" />;

	return (
		<div className="mx-auto max-w-3xl px-4">
			<h1 className="mb-6 text-center font-bold text-3xl">
				Newsletter Process Demonstration
			</h1>
			<div className="mb-6 rounded border-muted-foreground border-l-4 bg-accent p-4 text-muted-foreground shadow-md">
				<p className="font-bold">How Our Automated Newsletter System Works</p>
				<p className="mt-2">
					This page demonstrates what happens when our scheduled task runs to create
					a new newsletter. Here's the process:
				</p>
				<ol className="mt-2 list-inside list-decimal">
					<li>
						Our system automatically gathers the latest content for the newsletter.
					</li>
					<li>It then uses this information to create a draft of the newsletter.</li>
					<li>Once the draft is ready, the assigned reviewer receives an email.</li>
					<li>
						The email contains a link to a page where the reviewer can view and edit
						the newsletter.
					</li>
					<li>
						After reviewing and making any necessary changes, the reviewer can approve
						the newsletter for sending.
					</li>
				</ol>
				<p className="mt-2">
					Click the buttons below to see simulations of different parts of this
					process.
				</p>
			</div>
			<div className="mb-5 flex justify-center space-x-4">
				<Button onClick={handleFullGenerate} disabled={fullMutation.isPending}>
					Full Newsletter Generation
				</Button>
				<Button
					onClick={handleSimulateEmail}
					variant={"outline"}
					disabled={emailMutation.isPending || !data.length}
				>
					Simulate Email Sending
				</Button>
			</div>
			{fullMutation.isPending && (
				<div className="mt-3 text-center text-gray-600 text-sm">
					Simulating process... This usually takes a few minutes in the real system.
				</div>
			)}
			{fullMutation.isSuccess && (
				<Alert className="mt-4">
					<AlertTitle>Full Process Complete!</AlertTitle>
					<AlertDescription>
						A new newsletter draft has been created and an email has been sent to the
						reviewer.{" "}
						<Link
							to={"/newsletters/$newsletterId"}
							params={{ newsletterId: fullMutation.data.newsletter.id }}
							className="text-blue-500 hover:underline"
						>
							View Example Newsletter Page
						</Link>
					</AlertDescription>
				</Alert>
			)}

			{emailMutation.isPending && (
				<div className="mt-3 text-center text-gray-600 text-sm">
					Simulating email sending...
				</div>
			)}
			{emailMutation.isSuccess && (
				<Alert className="mt-4">
					<AlertTitle>Email Sent!</AlertTitle>
					<AlertDescription className="flex flex-col gap-4">
						<div>
							An email has been sent to the reviewer for the existing newsletter draft.
							Check the inbox of {import.meta.env.EMAIL_FROM} to see the email.{" "}
						</div>

						<Link
							to={"/newsletters/$newsletterId"}
							params={{ newsletterId: data[0].id }}
							className="text-blue-500 hover:underline"
						>
							Alternatively, View Example Newsletter Page without opening the email
						</Link>
					</AlertDescription>
				</Alert>
			)}

			{(fullMutation.isError || emailMutation.isError) && (
				<Alert variant="destructive" className="mt-4">
					<AlertTitle>Error in Demonstration</AlertTitle>
					<AlertDescription>
						An error occurred while demonstrating the process. In a real scenario, our
						team would be notified to investigate and resolve any issues.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
