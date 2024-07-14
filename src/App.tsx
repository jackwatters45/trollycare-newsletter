import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type { ArticleDisplayData, NewsletterData } from "./types";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { useCallback, useRef, useState } from "react";
import type { TextAreaRef } from "rc-textarea";

// TODO: REMOVE DUPS IE TITLES

// TODO: update backend logic

// TODO: routes to change summary, article description, or remove article, submit

// TODO: loading + error states

// TODO: make these dynamic

// TODO: maoin page to edit recipients
function App() {
	const { data, error, isLoading } = useQuery<NewsletterData>({
		queryKey: ["articles"],
		queryFn: async () => {
			const res = await fetch(
				`${import.meta.env.VITE_BASE_URL}/api/newsletters/1/`,
			);

			return await res.json();
		},
	});

	if (error) return <div>Error: {error.message}</div>;

	if (isLoading || !data) return <div>Loading...</div>;

	console.log(data);
	return (
		<div className="w-full h-full">
			<div className="container mx-auto max-w-screen-sm py-16 space-y-8">
				<header className="space-y-6">
					<h1>TrollyCare Newsletter</h1>
					<Card>
						<CardHeader>
							<CardTitle>Instructions</CardTitle>
						</CardHeader>
						<CardContent>
							<ol className="list-decimal list-inside space-y-2">
								<li>Review Summary. Click the edit summary button to make changes.</li>
								<li>
									Click the delete icon to remove the article from the newsletter.
								</li>
								<li>
									Confirm the contents of the newsletter by clicking the confirmation
									button at the bottom of the page.
								</li>
							</ol>
						</CardContent>
					</Card>
				</header>
				<main className="space-y-8">
					<Summary initial={data?.summary} />
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
												<Article article={article} key={article.title} />
											))}
										</ul>
									</CardContent>
								</li>
							</Card>
						))}
					</ul>
					<div className="w-full flex justify-end">
						<ConfirmSendAlert />
					</div>
				</main>
			</div>
		</div>
	);
}

export default App;

function Summary(props: { initial: string }) {
	const [isEditing, setIsEditing] = useState(false);

	const [summary, setSummary] = useState(props.initial);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<h2>Summary</h2>
					<div className="flex items-center space-x-4">
						{isEditing && (
							<span className="text-sm text-muted-foreground">(Editing)</span>
						)}
						{isEditing ? (
							<Button
								size={"sm"}
								variant={"secondary"}
								onClick={() => setIsEditing(false)}
							>
								Save Summary
							</Button>
						) : (
							<Button size={"sm"} onClick={() => setIsEditing(true)}>
								Edit Summary
							</Button>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Textarea
					className="disabled:cursor-pointer"
					value={summary}
					onChange={(e) => setSummary(e.target.value)}
					disabled={!isEditing}
				/>
			</CardContent>
		</Card>
	);
}

function Article(props: { article: ArticleDisplayData }) {
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

	const handleSaveClick = useCallback(() => setIsEditing(false), []);

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
				<RemoveArticleAlert />
			</div>
		</Card>
	);
}

function RemoveArticleAlert() {
	const onConfirm = () => {
		// TODO: remove article from database
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

function ConfirmSendAlert() {
	const onConfirm = () => {
		// TODO: send newsletter
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button>Confirm Newsletter</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure the newsletter is ready to be sent?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This will send the newsletter to your clients. Please verify that all
						articles are up to standard.
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
