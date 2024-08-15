import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SortableArticle from "./sortable-article";
import type { Category } from "@/types";

export function CategoryCard({
	category,
	newsletterId,
}: { category: Category; newsletterId: string }) {
	const { setNodeRef } = useDroppable({ id: category.name });

	return (
		<Card ref={setNodeRef}>
			<li>
				<CardHeader>
					<CardTitle>{category.name}</CardTitle>
				</CardHeader>
				<CardContent>
					<SortableContext
						items={category.articles.map((article) => article.id)}
						strategy={verticalListSortingStrategy}
					>
						<ul className="space-y-4">
							{category.articles.map((article) => (
								<SortableArticle
									key={article.id}
									id={article.id}
									article={article}
									newsletterId={newsletterId}
								/>
							))}
						</ul>
					</SortableContext>
				</CardContent>
			</li>
		</Card>
	);
}
