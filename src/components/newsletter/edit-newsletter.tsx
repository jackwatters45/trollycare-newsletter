import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Summary from "./summary";
import ArticleComponent from "./article";
import ConfirmSendAlert from "./send-alert";
import type { Newsletter } from "@/types";

export default function EditNewsletter(
	props: Newsletter & { newsletterId: string },
) {
	return (
		<>
			<Summary initial={props.summary} newsletterId={props.newsletterId} />
			<ul className="space-y-8">
				{props?.categories?.map((category) => (
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
			{props.status === "DRAFT" && (
				<div className="w-full flex justify-end">
					<ConfirmSendAlert newsletterId={props.newsletterId} />
				</div>
			)}
		</>
	);
}
