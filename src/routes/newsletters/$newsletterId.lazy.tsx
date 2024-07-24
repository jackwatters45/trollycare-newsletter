import { createLazyFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { NewsletterWithRecipients } from "@/types";
import type { APIError } from "@/lib/error";
import { getData, sendNewsletter } from "@/components/newsletter/actions";

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
import RecipientsForm from "@/components/newsletter/recipients-form";
import RecipientsDisplay from "@/components/newsletter/recipients-display";
import { useMemo } from "react";

const ProtectedNewsletter = withProtectedRoute(App);
export const Route = createLazyFileRoute("/newsletters/$newsletterId")({
	component: ProtectedNewsletter,
});

function App() {
	const { newsletterId } = Route.useParams();

	const { data, error, isLoading } = useQuery<
		NewsletterWithRecipients,
		APIError
	>({
		queryKey: ["article", newsletterId],
		queryFn: () => getData(newsletterId),
	});

	if (isLoading) return <Loading />;
	if (error) return <ErrorComponent error={error} />;
	if (!data) return <ErrorComponent error="No data available" />;

	switch (data.status) {
		case "DRAFT":
			return <DraftNewsletter newsletterId={newsletterId} {...data} />;
		case "FAILED":
			return <FailedNewsletter newsletterId={newsletterId} {...data} />;
		case "SENT":
			return <SentNewsletter {...data} />;
		default:
			return <ErrorComponent error="Unknown newsletter status" />;
	}
}

function DraftNewsletter(
	props: NewsletterWithRecipients & { newsletterId: string },
) {
	const recipientEmails = useMemo(
		() => props.recipients.map((r) => r.email),
		[props.recipients],
	);

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle>Instructions</CardTitle>
				</CardHeader>
				<CardContent>
					<ol className="list-decimal list-inside space-y-2">
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
				</TabsList>
				<TabsContent value="edit" className="space-y-8">
					<EditNewsletter {...props} />
				</TabsContent>
				<TabsContent value="preview" className="space-y-8">
					<div className="py-4 mt-4 border border-slate-300 rounded-lg shadow-md">
						<NewsletterPreview
							sendDate={props.createdAt}
							summary={props?.summary}
							categories={props?.categories}
						/>
					</div>
				</TabsContent>
				<TabsContent value="recipients" className="space-y-8">
					<div className="py-4 mt-4 border border-slate-300 rounded-lg shadow-md">
						<RecipientsForm
							recipientEmails={recipientEmails}
							newsletterId={props.newsletterId}
						/>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function FailedNewsletter(
	props: NewsletterWithRecipients & { newsletterId: string },
) {
	const queryClient = useQueryClient();

	const { mutate, isPending, isError, error } = useMutation<
		NewsletterWithRecipients,
		APIError
	>({
		mutationFn: () => sendNewsletter(props.newsletterId),
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
		<Card>
			<CardHeader>
				<CardTitle>Newsletter Send Failed</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="mb-4">
					Unfortunately, there was an issue sending this newsletter. The newsletter
					has been generated successfully, but we couldn't deliver it. You can try to
					send it again using the button below.
				</p>
				{isError && (
					<p className="text-red-500 mb-4">
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
	);
}

function SentNewsletter(props: NewsletterWithRecipients) {
	const recipientEmails = useMemo(
		() => props.recipients.map((r) => r.email),
		[props.recipients],
	);

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
			<Tabs defaultValue="edit" className="space-y-4">
				<TabsList>
					<TabsTrigger value="preview">Preview</TabsTrigger>
					<TabsTrigger value="recipients">Recipients</TabsTrigger>
				</TabsList>
				<TabsContent value="preview" className="space-y-8">
					<div className="py-4 mt-4 border border-slate-300 rounded-lg shadow-md">
						<NewsletterPreview
							sendDate={props.createdAt}
							summary={props?.summary}
							categories={props?.categories}
						/>
					</div>
				</TabsContent>
				<TabsContent value="recipients" className="space-y-8">
					<div className="p-4 mt-4 border border-slate-300 rounded-lg shadow-md space-y-4">
						<h3>Recipients</h3>
						<RecipientsDisplay recipientEmails={recipientEmails} />
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}