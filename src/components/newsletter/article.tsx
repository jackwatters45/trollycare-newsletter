import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { Article } from "@/types";
import { APIError } from "@/lib/error";

import { Card, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
	AlertDialogAction,
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useAuthenticatedFetch } from "@/lib/auth";
import { GripVertical } from "lucide-react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

const titleSchema = z.object({
	title: z.string().max(100, "Title must be less than 100 characters"),
});

const descriptionSchema = z.object({
	description: z
		.string()
		.max(500, "Description must be less than 500 characters"),
});

type TitleFormData = z.infer<typeof titleSchema>;
type DescriptionFormData = z.infer<typeof descriptionSchema>;

export default function ArticleComponent(props: {
	article: Article;
	newsletterId: string;
	attributes?: DraggableAttributes;
	listeners?: SyntheticListenerMap;
}) {
	const authenticatedFetch = useAuthenticatedFetch();
	const queryClient = useQueryClient();

	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [isEditingTitle, setIsEditingTitle] = useState(false);

	const titleForm = useForm<TitleFormData>({
		resolver: zodResolver(titleSchema),
		defaultValues: {
			title: props.article.title ?? "",
		},
	});

	const descriptionForm = useForm<DescriptionFormData>({
		resolver: zodResolver(descriptionSchema),
		defaultValues: {
			description: props.article.description ?? "",
		},
	});

	const descriptionMutation = useMutation<
		Article,
		APIError,
		DescriptionFormData
	>({
		mutationFn: async (data) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/articles/${props.article.id}/description`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				},
			);
			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		onSuccess: (updatedArticle) => {
			toast.success("Description updated successfully");
			setIsEditingDescription(false);
			descriptionForm.reset({ description: updatedArticle.description });
			queryClient.invalidateQueries({ queryKey: ["article", props.newsletterId] });
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to update description. Please try again.");
		},
	});

	const titleMutation = useMutation<Article, APIError, TitleFormData>({
		mutationFn: async (data) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/articles/${props.article.id}/title`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				},
			);
			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		onSuccess: (updatedArticle) => {
			toast.success("Title updated successfully");
			setIsEditingTitle(false);
			titleForm.reset({ title: updatedArticle.title });
			queryClient.invalidateQueries({ queryKey: ["article", props.newsletterId] });
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to update title. Please try again.");
		},
	});

	const onSubmitDescription = (data: DescriptionFormData) => {
		descriptionMutation.mutate(data);
	};

	const onSubmitTitle = (data: TitleFormData) => {
		titleMutation.mutate(data);
	};

	if (!props.article) return null;

	return (
		<Card className="flex flex-1 space-y-2 rounded-md border border-border py-4">
			<div
				className="-mr-3 z-10 h-fit pt-4 pl-3"
				{...props.attributes}
				{...props.listeners}
			>
				<div className="cursor-grab rounded-md p-1 text-muted-foreground hover:bg-accent active:cursor-grabbing">
					<DragHandleIcon />
				</div>
			</div>
			<div className="flex-1">
				<CardTitle className="w-full flex-1 px-6 font-bold text-lg">
					{isEditingTitle ? (
						<form onSubmit={titleForm.handleSubmit(onSubmitTitle)}>
							<Controller
								name="title"
								control={titleForm.control}
								render={({ field }) => (
									<Textarea
										{...field}
										className="h-fit w-full border-none p-0 font-bold text-lg italic focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
								)}
							/>
						</form>
					) : (
						<a
							href={props.article.link}
							target="_blank"
							rel="noreferrer"
							className="font-bold"
						>
							{titleForm.getValues().title}
						</a>
					)}
				</CardTitle>
				<div>
					<div className="w-full px-3">
						<form onSubmit={descriptionForm.handleSubmit(onSubmitDescription)}>
							<Controller
								name="description"
								control={descriptionForm.control}
								render={({ field }) => (
									<Textarea
										{...field}
										disabled={!isEditingDescription}
										className="disabled:cursor-auto"
									/>
								)}
							/>
						</form>
					</div>
				</div>
				<div className="flex items-center justify-between space-x-4 px-6 pt-2">
					<div className="space-x-4">
						{isEditingTitle ? (
							<Button
								size={"sm"}
								variant={"secondary"}
								onClick={titleForm.handleSubmit(onSubmitTitle)}
								disabled={titleMutation.isPending}
							>
								{titleMutation.isPending ? "Saving..." : "Save Title"}
							</Button>
						) : (
							<Button size={"sm"} onClick={() => setIsEditingTitle(true)}>
								Edit Title
							</Button>
						)}
						{isEditingDescription ? (
							<Button
								size={"sm"}
								variant={"secondary"}
								onClick={descriptionForm.handleSubmit(onSubmitDescription)}
								disabled={descriptionMutation.isPending}
							>
								{descriptionMutation.isPending ? "Saving..." : "Save Description"}
							</Button>
						) : (
							<Button size={"sm"} onClick={() => setIsEditingDescription(true)}>
								Edit Description
							</Button>
						)}
						{isEditingTitle && isEditingDescription ? (
							<span className="text-muted-foreground text-sm">(Editing)</span>
						) : null}
						{isEditingTitle && !isEditingDescription ? (
							<span className="text-muted-foreground text-sm">(Editing Title)</span>
						) : null}
						{isEditingDescription && !isEditingTitle ? (
							<span className="text-muted-foreground text-sm">
								(Editing Description)
							</span>
						) : null}
					</div>
					<RemoveArticleAlert
						article={props.article}
						newsletterId={props.newsletterId}
					/>
				</div>
			</div>
		</Card>
	);
}

function RemoveArticleAlert(props: { article: Article; newsletterId: string }) {
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const mutation = useMutation<Article, APIError>({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/articles/${props.article.id}`,
				{
					method: "DELETE",
				},
			);
			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["article", props.newsletterId],
			});
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to remove article. Please try again.");
		},
	});

	const onConfirm = () => {
		mutation.mutate();
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button size={"sm"} variant={"destructive"}>
					Delete
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to remove this article?
					</AlertDialogTitle>
					<AlertDialogDescription>
						Please confirm that you want to remove this article from the newsletter.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm} disabled={mutation.isPending}>
						{mutation.isPending ? "Removing..." : "Confirm"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function DragHandleIcon() {
	return (
		<div className="cursor-grab active:cursor-grabbing">
			<GripVertical className="h-5 w-5" />
		</div>
	);
}
