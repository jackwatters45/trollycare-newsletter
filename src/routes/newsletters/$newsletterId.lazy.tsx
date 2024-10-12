import { createLazyFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PopulatedNewsletter } from "@/types";
import { APIError } from "@/lib/error";

import Loading from "@/components/loading";
import ErrorComponent from "@/components/error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import EditNewsletter from "@/components/newsletter/edit-newsletter";
import { NewsletterPreview } from "@/components/newsletter/preview";
import { withProtectedRoute } from "@/components/protected";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthenticatedFetch } from "@/lib/auth";
import { useGetRecipients } from "@/lib/hooks";
import BlacklistedDomainsForm from "@/components/newsletter/blacklisted-sites";
import RecipientsTable from "@/components/newsletter/recipients-table";

const ProtectedNewsletter = withProtectedRoute(App);
export const Route = createLazyFileRoute("/newsletters/$newsletterId")({
	component: ProtectedNewsletter,
});

function App() {
	const { newsletterId } = Route.useParams();

	useGetRecipients();

	const authenticatedFetch = useAuthenticatedFetch();

	const {
		data: newsletter,
		error: newsletterError,
		isLoading: newsletterLoading,
	} = useQuery<PopulatedNewsletter, APIError>({
		queryKey: ["newsletter", newsletterId],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/${newsletterId}`,
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return await res.json();
		},
	});

	const {
		data: blacklistedDomains,
		isLoading: blacklistedDomainsLoading,
		error: blacklistedDomainsError,
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

	if (newsletterLoading || blacklistedDomainsLoading) return <Loading />;
	if (newsletterError || blacklistedDomainsError)
		return <ErrorComponent error={newsletterError || blacklistedDomainsError} />;
	if (!newsletter || !blacklistedDomains)
		return <ErrorComponent error="No data available" />;

	switch (newsletter.status) {
		case "DRAFT":
			return (
				<DraftNewsletter
					newsletterId={newsletterId}
					blacklistedDomains={blacklistedDomains}
					{...newsletter}
				/>
			);
		case "FAILED":
			return (
				<FailedNewsletter
					newsletterId={newsletterId}
					blacklistedDomains={blacklistedDomains}
					{...newsletter}
				/>
			);
		case "SENT":
			return <SentNewsletter {...newsletter} />;
		default:
			return <ErrorComponent error="Unknown newsletter status" />;
	}
}

function DraftNewsletter(
	props: PopulatedNewsletter & {
		newsletterId: string;
		blacklistedDomains: string[];
	},
) {
	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle>Instructions</CardTitle>
				</CardHeader>
				<CardContent>
					<ol className="list-inside list-decimal space-y-2">
						<li>Review Summary. Click the edit summary button to make changes.</li>
						<li>Click the delete icon to remove the article from the newsletter.</li>
						<li>
							Confirm the contents of the newsletter by clicking the confirmation
							button at the bottom of the page.
						</li>
					</ol>
				</CardContent>
			</Card>
			<Separator />
			<Tabs defaultValue="edit" className="space-y-4">
				<TabsList>
					<TabsTrigger value="edit">Edit</TabsTrigger>
					<TabsTrigger value="preview">Preview</TabsTrigger>
					<TabsTrigger value="recipients">Recipients</TabsTrigger>
					<TabsTrigger value="blacklisted-domains">
						Add Blacklisted Domain
					</TabsTrigger>
				</TabsList>
				<TabsContent value="edit" className="space-y-8">
					<EditNewsletter {...props} />
				</TabsContent>
				<TabsContent value="preview" className="space-y-8">
					<div className="mt-4 rounded-lg border border-slate-300 py-4 shadow-md">
						<NewsletterPreview
							sendDate={props.createdAt}
							summary={props?.summary}
							categories={props?.categories}
							ads={props?.ads}
						/>
					</div>
				</TabsContent>
				<TabsContent value="recipients" className="mt-4 space-y-8 pt-4 pb-6">
					<RecipientsTable recipients={props.recipients} />
				</TabsContent>
				<TabsContent
					value="blacklisted-domains"
					className="mt-4 space-y-8 pt-4 pb-6"
				>
					<BlacklistedDomainsForm blacklistedDomains={props.blacklistedDomains} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

function FailedNewsletter(
	props: PopulatedNewsletter & {
		newsletterId: string;
		blacklistedDomains: string[];
	},
) {
	const queryClient = useQueryClient();

	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate, isPending, isError, error } = useMutation<
		PopulatedNewsletter,
		APIError
	>({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/${props.newsletterId}/send`,
				{
					method: "POST",
				},
			);
			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		onError: (error) => {
			console.error("Failed to send newsletter:", error);
			toast.error("Failed to send newsletter. Please try again.");
		},
		onSuccess: () => {
			toast.success("Newsletter sent successfully");
			queryClient.invalidateQueries({ queryKey: ["newsletters"] });
			queryClient.invalidateQueries({
				queryKey: ["article", props.newsletterId],
			});
		},
	});

	const onClick = () => mutate();

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Newsletter Send Failed</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-4">
						Unfortunately, there was an issue sending this newsletter. The newsletter
						has been generated successfully, but we couldn't deliver it. You can try
						to send it again using the button below.
					</p>
					{isError && (
						<p className="mb-4 text-red-500">
							Error: {error?.message || "An unexpected error occurred"}
						</p>
					)}
					<Button
						onClick={onClick}
						disabled={isPending}
						className="flex items-center"
					>
						{isPending ? "Sending Newsletter..." : "Retry Send"}
					</Button>
				</CardContent>
			</Card>
			<DraftNewsletter {...props} />
		</>
	);
}

function SentNewsletter(props: PopulatedNewsletter) {
	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle>Newsletter {props.id}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<p>
							<strong>Status:</strong> {props.status}
						</p>
						<p>
							<strong>Sent Date:</strong> {new Date(props.sendAt).toLocaleString()}
						</p>
						<p>
							<strong>Created Date:</strong>{" "}
							{new Date(props.createdAt).toLocaleString()}
						</p>
					</div>
				</CardContent>
			</Card>
			<Separator />
			<Tabs defaultValue="preview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="preview">Preview</TabsTrigger>
					<TabsTrigger value="recipients">Recipients</TabsTrigger>
				</TabsList>
				<TabsContent value="preview" className="space-y-8">
					<div className="mt-4 rounded-lg border border-slate-300 py-4 shadow-md">
						<NewsletterPreview
							sendDate={props.createdAt}
							summary={props?.summary}
							categories={props?.categories}
							ads={props?.ads}
						/>
					</div>
				</TabsContent>
				<TabsContent value="recipients" className="space-y-8">
					<div className="mt-4 space-y-4 rounded-lg border border-slate-300 p-4 pt-8 shadow-md">
						<RecipientsTable recipients={props.recipients} />
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
