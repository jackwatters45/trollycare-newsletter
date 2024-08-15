import { DndContext, closestCorners, DragOverlay } from "@dnd-kit/core";

import Summary from "./summary";
import ArticleComponent from "./article";
import ConfirmSendAlert from "./send-alert";
import type { PopulatedNewsletter } from "@/types";
import { AddArticle } from "./add-article";
import { CategoryCard } from "./category-card";
import useNewsletter from "./useNewsletter";
import { useGetRecipients } from "@/lib/hooks";
import ErrorComponent from "../error";
import Loading from "../loading";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";

export default function EditNewsletter(
	props: PopulatedNewsletter & { newsletterId: string },
) {
	const {
		categories,
		activeId,
		activeArticle,
		sensors,
		handleDragStart,
		handleDragEnd,
		handleDragOver,
	} = useNewsletter(props);

	const recipientsQuery = useGetRecipients();

	if (recipientsQuery.isLoading) return <Loading />;
	if (recipientsQuery.error)
		return <ErrorComponent error={recipientsQuery.error} />;
	if (!recipientsQuery.data) return <ErrorComponent error="No data available" />;

	return (
		<>
			<Summary initial={props.summary} newsletterId={props.newsletterId} />
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragOver={handleDragOver}
			>
				<ul className="space-y-8">
					{categories.map((category) => (
						<CategoryCard
							key={category.name}
							category={category}
							newsletterId={props.newsletterId}
						/>
					))}
				</ul>
				<DragOverlay>
					{activeId && activeArticle ? (
						<ArticleComponent
							article={activeArticle}
							newsletterId={props.newsletterId}
						/>
					) : null}
				</DragOverlay>
			</DndContext>
			<AddArticle newsletterId={props.newsletterId} />
			<div className="w-full flex justify-end pb-8">
				{props.status === "DRAFT" && recipientsQuery.data.length > 0 && (
					<div className="w-full flex justify-end">
						<ConfirmSendAlert newsletterId={props.newsletterId} />
					</div>
				)}
				{recipientsQuery.data.length === 0 && (
					<Link to="/">
						<Button variant="destructive" className="w-full justify-start">
							No recipients found. Please add recipients to the newsletter.
						</Button>
					</Link>
				)}
			</div>
		</>
	);
}
