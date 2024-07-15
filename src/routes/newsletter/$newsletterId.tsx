import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import type { Newsletter } from "@/types";
import type { APIError } from "@/lib/error";
import { getData } from "@/components/newsletter/actions";

import Loading from "@/components/loading";
import ErrorComponent from "@/components/error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Summary from "@/components/newsletter/summary";
import ArticleComponent from "@/components/newsletter/article";
import ConfirmSendAlert from "@/components/newsletter/send";

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
		<>
			<header className="space-y-6">
				<h1>TrollyCare Newsletter</h1>
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
			</header>
			<main className="space-y-8">
				<Summary initial={data?.summary} newsletterId={newsletterId} />
				<ul className="space-y-4">
					{data?.categories?.map((category) => (
						<Card key={category.name}>
							<li key={category.name}>
								<CardHeader>
									<CardTitle>{category.name}</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-4">
										{category.articles.map((article) => (
											<ArticleComponent
												key={article.title}
												article={article}
												newsletterId={newsletterId}
											/>
										))}
									</ul>
								</CardContent>
							</li>
						</Card>
					))}
				</ul>
				<div className="w-full flex justify-end">
					<ConfirmSendAlert newsletterId={newsletterId} />
				</div>
			</main>
		</>
	);
}
