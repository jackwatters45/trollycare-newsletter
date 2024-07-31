import { toast } from "sonner";
import { useCallback, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TextAreaRef } from "rc-textarea";

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

export default function ArticleComponent(props: {
	article: Article;
	newsletterId: string;
}) {
	const authenticatedFetch = useAuthenticatedFetch();

	const textareaRef = useRef<TextAreaRef>(null);

	const [isEditing, setIsEditing] = useState(false);

	const [description, setDescription] = useState(props.article.description);
	const handleEditClick = useCallback(() => {
		setIsEditing(true);
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				// Move cursor to the end
				const length = textareaRef.current.resizableTextArea.textArea.value.length;
				textareaRef.current.resizableTextArea.textArea.setSelectionRange(
					length,
					length,
				);
			}
		}, 0);
	}, []);

	const { mutate } = useMutation<Article, APIError>({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/articles/${props.article.id}/description`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						description,
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
			console.log(error);
			toast.error("Failed to update description. Please try again.");
		},
	});

	const handleSaveClick = useCallback(() => {
		mutate();
		setIsEditing(false);
	}, [mutate]);

	return (
		<Card className="space-y-2 border rounded-md border-border py-4">
			<CardTitle className="font-bold flex-1 text-lg px-6">
				<a
					href={props.article.link}
					target="_blank"
					rel="noreferrer"
					className="font-bold"
				>
					{props.article.title}
				</a>
			</CardTitle>
			<div>
				<div className="w-full px-3">
					<Textarea
						id={props.article.title}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						disabled={!isEditing}
						className="disabled:cursor-pointer"
						ref={textareaRef}
					/>
				</div>
			</div>
			<div className="flex items-center justify-between space-x-4 px-6">
				<div className="space-x-4 pt-2">
					{isEditing ? (
						<Button size={"sm"} variant={"secondary"} onClick={handleSaveClick}>
							Save
						</Button>
					) : (
						<Button size={"sm"} onClick={handleEditClick}>
							Edit
						</Button>
					)}
					{isEditing && (
						<span className="text-sm text-muted-foreground">(Editing)</span>
					)}
				</div>
				<RemoveArticleAlert
					article={props.article}
					newsletterId={props.newsletterId}
				/>
			</div>
		</Card>
	);
}

function RemoveArticleAlert(props: { article: Article; newsletterId: string }) {
	const queryClient = useQueryClient();

	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate } = useMutation<Article, APIError>({
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
			console.log(error);
			toast.error("Failed to remove article. Please try again.");
		},
	});

	const onConfirm = () => {
		mutate();
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
					<AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
