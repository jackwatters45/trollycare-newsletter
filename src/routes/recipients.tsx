import { createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/lib/auth";
import { APIError } from "@/lib/error";
import ErrorComponent from "@/components/error";
import Loading from "@/components/loading";
import RecipientsTable from "@/components/newsletter/recipients-table";
import RecipientsForm from "@/components/newsletter/recipients-form";

export const Route = createFileRoute("/recipients")({
	component: Recipients,
});

function Recipients() {
	const authenticatedFetch = useAuthenticatedFetch();

	const { data, isLoading, error } = useQuery({
		queryKey: ["newsletters", "recipients"],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/recipients`,
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return await res.json();
		},
	});

	if (isLoading) return <Loading />;
	if (error) return <ErrorComponent error={error} />;
	if (!data) return <ErrorComponent error="No data available" />;

	return (
		<div className="container mx-auto space-y-8">
			<RecipientsForm />
			<h2>Newsletter Recipients</h2>
			<RecipientsTable recipients={data} />
		</div>
	);
}
