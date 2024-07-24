import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { APIError } from "@/lib/error";
import Loading from "@/components/loading";
import ErrorComponent from "@/components/error";
import type { Recipient } from "@/types";
import { withProtectedRoute } from "@/components/protected";
import { useAuthenticatedFetch } from "@/lib/auth";
import RecipientsForm from "@/components/newsletter/recipients-form";

const ProtectedIndex = withProtectedRoute(Index);
export const Route = createLazyFileRoute("/")({
	component: ProtectedIndex,
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

	return <RecipientsForm recipientEmails={data} />;
}
