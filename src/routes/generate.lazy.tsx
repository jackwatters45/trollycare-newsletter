import { useAuthenticatedFetch } from "@/lib/auth";
import { APIError } from "@/lib/error";
import { useMutation } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import type { Newsletter } from "@/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { withProtectedRoute } from "@/components/protected";

const ProtectedGenerateNew = withProtectedRoute(GenerateNew);
export const Route = createLazyFileRoute("/generate")({
	component: ProtectedGenerateNew,
});

function GenerateNew() {
	const authenticatedFetch = useAuthenticatedFetch();

	const mutation = useMutation({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/generate`,
				{
					method: "POST",
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			const newsletter = (await res.json()) as Newsletter;

			return newsletter;
		},
		onError: (error) => {
			console.error("An error occurred:", error);
		},
	});

	const handleGenerate = () => mutation.mutate();

	return (
		<div className="mx-auto max-w-3xl px-4">
			<h1 className="mb-6 text-center font-bold text-3xl">Newsletter Generator</h1>
			<div className="mb-6 rounded border-muted-foreground border-l-4 bg-accent p-4 text-muted-foreground shadow-md">
				<p className="font-bold">Manual Newsletter Generation</p>
				<p className="mt-2">
					This page allows you to create a new newsletter manually. While we have an
					automatic system that generates newsletters regularly, sometimes things
					don't go as planned. If the automatic process hasn't worked for any reason,
					you can use this page to create a new newsletter yourself.
				</p>
				<p className="mt-2">
					Simply click the "Generate New Data" button below, and we'll gather all the
					latest information to create a fresh newsletter for you. It might take a
					few minutes, but once it's done, you'll be able to review and send out the
					newsletter as usual.
				</p>
			</div>
			<Button
				onClick={handleGenerate}
				className="mx-auto block"
				disabled={mutation.isPending}
			>
				Generate New Data
			</Button>

			{mutation.isPending && (
				<div className="mt-3 text-center text-muted-foreground text-sm">
					Generation will take a few minutes...
				</div>
			)}
			{mutation.isSuccess && (
				<Alert className="mt-4">
					<AlertTitle>Success</AlertTitle>
					<AlertDescription>
						Data generated successfully.{" "}
						<Link
							to={"/newsletters/$newsletterId"}
							params={{ newsletterId: mutation.data.id }}
							className="text-blue-500 hover:underline"
						>
							View Newsletter
						</Link>
					</AlertDescription>
				</Alert>
			)}
			{mutation.isError && (
				<Alert variant="destructive" className="mt-4">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						{mutation.error instanceof Error
							? mutation.error.message
							: "An error occurred"}
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
