import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ArticleComponent from "./article";
import type { Article } from "@/types";

export default function SortableArticle(props: {
	id: string;
	article: Article;
	newsletterId: string;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: props.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} className="flex items-center">
			<div className="flex-grow flex">
				<ArticleComponent
					article={props.article}
					newsletterId={props.newsletterId}
					attributes={attributes}
					listeners={listeners}
				/>
			</div>
		</div>
	);
}
