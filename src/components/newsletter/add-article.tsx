import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { APIError } from "@/lib/error";
import { useAuthenticatedFetch } from "@/lib/auth";
import { CATEGORIES } from "@/lib/constants";
import type { Article } from "@/types";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const articleSchema = z.object({
	newsletterId: z.string(),
	title: z.string().min(4).max(100),
	link: z.string().url(),
	category: z.enum(CATEGORIES),
	description: z
		.union([z.string().min(50).max(250), z.string().max(0)])
		.optional(),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

export function AddArticle(props: { newsletterId: string }) {
	const currentYear = new Date().getFullYear();
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const form = useForm<ArticleFormValues>({
		resolver: zodResolver(articleSchema),
		defaultValues: {
			newsletterId: props.newsletterId,
			title: "",
			link: "",
			category: CATEGORIES[0],
			description: "",
		},
	});

	const { mutate } = useMutation<Article, APIError, ArticleFormValues>({
		mutationFn: async (values: ArticleFormValues) => {
			if (!values.description) {
				toast.loading("Generating AI description...");
			}

			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/articles`,
				{
					method: "POST",
					body: JSON.stringify(values),
					headers: {
						"Content-Type": "application/json",
					},
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
			toast.error("Failed to add article. Please try again.");
		},
		onSuccess: (data) => {
			console.log(data);
			toast.dismiss();
			toast.success("Article added successfully");
			queryClient.invalidateQueries({
				queryKey: ["newsletter", props.newsletterId],
			});
			form.reset();
		},
	});

	const submitForm = (values: ArticleFormValues) => {
		mutate(values);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Add Your Own Articles</CardTitle>
				<CardDescription>Add your own articles to the newsletter.</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(submitForm)}>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input
												value={field.value}
												onChange={field.onChange}
												placeholder={`How homecare is changing in the year ${currentYear}...`}
												className="flex-grow"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							control={form.control}
							name="link"
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Link</FormLabel>
										<FormControl>
											<Input
												value={field.value}
												onChange={field.onChange}
												placeholder={`https://www.trollycare.com/how-homecare-is-changing-in-the-year-${currentYear}/`}
												className="flex-grow"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							control={form.control}
							name="category"
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<FormControl>
											<Select value={field.value} onValueChange={field.onChange}>
												<SelectTrigger>
													<SelectValue placeholder={CATEGORIES[0]} />
												</SelectTrigger>
												<SelectContent>
													{CATEGORIES.map((category) => (
														<SelectItem key={category} value={category}>
															{category}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Description (Leave Blank to let AI Generate)</FormLabel>
										<FormControl>
											<Input
												value={field.value}
												onChange={field.onChange}
												placeholder="Explore how technology and demographic shifts are revolutionizing in-home care services..."
												className="flex-grow"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<Button type="submit">Add Article</Button>
						<FormMessage />
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
