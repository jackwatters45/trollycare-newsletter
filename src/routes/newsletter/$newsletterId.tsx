import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import type { Newsletter } from "@/types";
import type { APIError } from "@/lib/error";
import { getData } from "@/components/newsletter/actions";

import Loading from "@/components/loading";
import ErrorComponent from "@/components/error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import EditNewsletter from "@/components/newsletter/edit-newsletter";
import { NewsletterPreview } from "@/components/newsletter/preview";

export const Route = createFileRoute("/newsletter/$newsletterId")({
	component: () => <App />,
});

export default function App() {
	const { newsletterId } = Route.useParams();

	const { data, error, isLoading } = useQuery<Newsletter, APIError>({
		queryKey: ["article", newsletterId],
		queryFn: () => getData(newsletterId),
	});

	if (isLoading) return <Loading />;
	if (error) return <ErrorComponent error={error} />;
	if (!data) return <ErrorComponent error="No data available" />;

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
				</TabsList>
				<TabsContent value="edit" className="space-y-8">
					<EditNewsletter newsletterId={newsletterId} data={data} />
				</TabsContent>
				<TabsContent value="preview" className="space-y-8">
					<div className="py-4 mt-4 border border-slate-300 rounded-lg shadow-md">
						<NewsletterPreview
							sendDate={data.createdAt}
							summary={data?.summary}
							categories={data?.categories}
						/>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
