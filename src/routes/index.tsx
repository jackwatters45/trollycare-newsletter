import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { APIError } from "@/lib/error";
import Loading from "@/components/loading";
import ErrorComponent from "@/components/error";
import { withProtectedRoute } from "@/components/protected";
import { useAuthenticatedFetch } from "@/lib/auth";
import EditFrequency from "@/components/newsletter/edit-frequency";
import { useGetRecipients } from "@/lib/hooks";
import ReviewersForm from "@/components/newsletter/reviewers-form";
import type { Reviewer } from "@/types";
import BlacklistedDomainsForm from "@/components/newsletter/blacklisted-sites";

const ProtectedIndex = withProtectedRoute(Index);
export const Route = createFileRoute("/")({
	component: ProtectedIndex,
});

function Index() {
	const authenticatedFetch = useAuthenticatedFetch();

	const {
		data: recipients,
		isLoading: recipientsLoading,
		error: recipientsError,
	} = useGetRecipients();

	useQuery({
		queryKey: ["newsletters", "frequency"],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/frequency`,
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return await res.json();
		},
	});

	const {
		data: reviewers,
		isLoading: reviewersLoading,
		error: reviewersError,
	} = useQuery<string[]>({
		queryKey: ["reviewers"],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/reviewers`,
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return ((await res.json()) as Reviewer[]).map((reviewer) => reviewer.email);
		},
	});

	const {
		data: domains,
		isLoading: domainsLoading,
		error: domainsError,
	} = useQuery<string[]>({
		queryKey: ["blacklisted-domains"],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/blacklisted-domains/external`,
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return await res.json();
		},
	});

	if (recipientsLoading || reviewersLoading || domainsLoading)
		return <Loading />;
	if (recipientsError || reviewersError || domainsError)
		return (
			<ErrorComponent error={recipientsError || reviewersError || domainsError} />
		);
	if (!recipients || !reviewers || !domains)
		return <ErrorComponent error="No data available" />;

	return (
		<>
			<EditFrequency />
			<ReviewersForm reviewerEmails={reviewers} />
			<BlacklistedDomainsForm blacklistedDomains={domains} />
		</>
	);
}
