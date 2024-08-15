import { DndContext, closestCorners, DragOverlay } from "@dnd-kit/core";

import Summary from "./summary";
import ArticleComponent from "./article";
import ConfirmSendAlert from "./send-alert";
import type { PopulatedNewsletter } from "@/types";
import { AddArticle } from "./add-article";
import { CategoryCard } from "./category-card";
import useNewsletter from "./useNewsletter";

// TODO: backend

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
			{props.status === "DRAFT" && (
				<div className="w-full flex justify-end">
					<ConfirmSendAlert newsletterId={props.newsletterId} />
				</div>
			)}
			<AddArticle newsletterId={props.newsletterId} />
		</>
	);
}
