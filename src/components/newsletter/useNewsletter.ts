import { useMemo, useState } from "react";
import {
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragStartEvent,
	type DragEndEvent,
	type UniqueIdentifier,
	type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Category, PopulatedNewsletter } from "@/types";
import { APIError } from "@/lib/error";
import { useMutation } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@/lib/auth";
import { toast } from "sonner";

interface UpdateOrderParams {
	category: Category;
	articleIds: string[];
}

interface UpdateCategoryParams {
	articleId: string;
	fromCategoryId: Category;
	toCategoryId: Category;
}

export default function useNewsletter(
	props: PopulatedNewsletter & { newsletterId: string },
) {
	const authenticatedFetch = useAuthenticatedFetch();
	const [categories, setCategories] = useState(props.categories);
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const updateCategoryMutation = useMutation<
		void,
		APIError,
		UpdateCategoryParams
	>({
		mutationFn: async (variables) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/${props.newsletterId}/update-category/${variables.articleId}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						toCategoryId: variables.toCategoryId,
					}),
				},
			);
			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to update category. Please try again.");
		},
	});

	const updateOrderMutation = useMutation<void, APIError, UpdateOrderParams>({
		mutationFn: async (params) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/${props.newsletterId}/update-order`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						articleIds: params.articleIds,
					}),
				},
			);
			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to update order. Please try again.");
		},
	});

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		setActiveId(active.id);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) return;

		const activeArticleId = active.id as string;
		const overId = over.id as string;

		setCategories((prevCategories) => {
			const activeCategory = prevCategories.find((category) =>
				category.articles.some((article) => article.id === activeArticleId),
			);

			if (!activeCategory) return prevCategories;

			const overCategory = prevCategories.find(
				(category) =>
					category.name === overId ||
					category.articles.some((article) => article.id === overId),
			);

			if (!overCategory) return prevCategories;

			if (activeCategory === overCategory) {
				// Reordering within the same category
				const newArticles = arrayMove(
					activeCategory.articles,
					activeCategory.articles.findIndex(
						(article) => article.id === activeArticleId,
					),
					activeCategory.articles.findIndex((article) => article.id === overId),
				);

				updateOrderMutation.mutate({
					category: activeCategory,
					articleIds: newArticles.map((article) => article.id),
				});

				return prevCategories.map((category) =>
					category === activeCategory
						? { ...category, articles: newArticles }
						: category,
				);
			}
			// Moving to a different category
			const updatedCategories = prevCategories.map((category) => {
				if (category === activeCategory) {
					return {
						...category,
						articles: category.articles.filter(
							(article) => article.id !== activeArticleId,
						),
					};
				}
				if (category === overCategory) {
					const newArticles = [...category.articles];
					const [activeArticle] = activeCategory.articles.filter(
						(article) => article.id === activeArticleId,
					);
					const overIndex = category.articles.findIndex(
						(article) => article.id === overId,
					);
					newArticles.splice(
						overIndex >= 0 ? overIndex : newArticles.length,
						0,
						activeArticle,
					);
					return { ...category, articles: newArticles };
				}
				return category;
			});

			updateCategoryMutation.mutate({
				articleId: activeArticleId,
				fromCategoryId: activeCategory,
				toCategoryId: overCategory,
			});

			return updatedCategories;
		});

		setActiveId(null);

		const movedItem = document.getElementById(active.id as string);
		if (movedItem) {
			movedItem.focus();
		}
		// TODO: Implement API call to update the order on the server
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;

		if (!over) return;

		const activeArticleId = active.id as string;
		const overId = over.id as string;

		// Find the categories of the active and over elements
		const activeCategory = categories.find((category) =>
			category.articles.some((article) => article.id === activeArticleId),
		);
		const overCategory = categories.find(
			(category) =>
				category.name === overId ||
				category.articles.some((article) => article.id === overId),
		);

		// If not dragging over another category or article, return
		if (!activeCategory || !overCategory) return;

		// If dragging over a different category
		if (activeCategory !== overCategory) {
			setCategories((prevCategories) => {
				const activeCategoryIndex = prevCategories.indexOf(activeCategory);
				const overCategoryIndex = prevCategories.indexOf(overCategory);

				// Remove the active article from its original category
				const updatedActiveCategory = {
					...activeCategory,
					articles: activeCategory.articles.filter(
						(article) => article.id !== activeArticleId,
					),
				};

				// Find the active article
				const [activeArticle] = activeCategory.articles.filter(
					(article) => article.id === activeArticleId,
				);

				// Add the active article to the new category
				const updatedOverCategory = {
					...overCategory,
					articles: [...overCategory.articles, activeArticle],
				};

				// Create a new categories array with the updates
				const newCategories = [...prevCategories];
				newCategories[activeCategoryIndex] = updatedActiveCategory;
				newCategories[overCategoryIndex] = updatedOverCategory;

				return newCategories;
			});
		}
	};

	const activeArticle = useMemo(() => {
		const article = categories
			.flatMap((c) => c.articles)
			.find((a) => a.id === activeId);

		if (!article) return null;

		return article;
	}, [activeId, categories]);

	return {
		categories,
		activeId,
		activeArticle,
		sensors,
		handleDragStart,
		handleDragEnd,
		handleDragOver,
	};
}
