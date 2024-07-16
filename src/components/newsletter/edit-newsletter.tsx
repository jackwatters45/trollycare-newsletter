import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Summary from "./summary";
import ArticleComponent from "./article";
import ConfirmSendAlert from "./send";
import type { Newsletter } from "@/types";

export default function EditNewsletter(props: {
	newsletterId: string;
	data: Newsletter;
}) {
	return (
		<>
			<Summary initial={props.data?.summary} newsletterId={props.newsletterId} />
			<ul className="space-y-8">
				{props.data?.categories?.map((category) => (
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
											newsletterId={props.newsletterId}
										/>
									))}
								</ul>
							</CardContent>
						</li>
					</Card>
				))}
			</ul>
			<div className="w-full flex justify-end">
				<ConfirmSendAlert newsletterId={props.newsletterId} />
			</div>
		</>
	);
}
