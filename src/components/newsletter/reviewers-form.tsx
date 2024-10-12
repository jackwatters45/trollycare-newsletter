import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useRef } from "react";
import Papa from "papaparse";

import { APIError } from "@/lib/error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Form,
	FormDescription,
} from "@/components/ui/form";
import { useAuthenticatedFetch } from "@/lib/auth";
import {
	AlertDialogDescription,
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "../ui/alert-dialog";
import { Card } from "../ui/card";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const reviewersFormSchema = z.object({
	reviewers: z.array(z.string()),
	"new-reviewer": z.string(),
});

export type ReviewersFormSchema = z.infer<typeof reviewersFormSchema>;

export default function ReviewersForm(props: {
	reviewerEmails: string[];
	newsletterId?: string;
}) {
	const form = useForm<z.infer<typeof reviewersFormSchema>>({
		resolver: zodResolver(reviewersFormSchema),
		defaultValues: {
			reviewers: props.reviewerEmails,
			"new-reviewer": "",
		},
	});

	return (
		<Card className="p-6">
			<Form {...form}>
				<form className="container mx-auto space-y-8 px-0">
					<div className="space-y-6">
						<h2 className="font-bold text-2xl">Newsletter Reviewers</h2>
						<FormDescription>
							Add email addresses of reviewers who will be sent the newsletter to
							confirm its quality. You can add multiple email addresses by separating
							them with a comma.
						</FormDescription>
					</div>
					<div className="space-y-4">
						<div className="flex items-center justify-end space-x-2">
							<CSVUpload form={form} newsletterId={props.newsletterId} />
							<RemoveAllReviewers form={form} newsletterId={props.newsletterId} />
						</div>
						<NewReviewerInput form={form} newsletterId={props.newsletterId} />
						<ReviewersInput form={form} newsletterId={props.newsletterId} />
					</div>
				</form>
			</Form>
		</Card>
	);
}

interface ReviewersFormInputProps {
	form: UseFormReturn<ReviewersFormSchema>;
	newsletterId?: string;
}

export function CSVUpload(props: ReviewersFormInputProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const addReviewersMutation = useMutation<string[], APIError, string[]>({
		mutationFn: async (emails: string[]) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/reviewers/bulk`,
				{
					method: "POST",
					body: JSON.stringify({ emails }),
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		onSuccess: (addedEmails) => {
			queryClient.invalidateQueries({ queryKey: ["reviewers"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
			const currentReviewers = props.form.getValues().reviewers;
			const newReviewers = [...new Set([...currentReviewers, ...addedEmails])];
			props.form.setValue("reviewers", newReviewers);
			toast.success(`Added ${addedEmails.length} new reviewer(s)`);
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to add reviewers. Please try again.");
		},
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			Papa.parse(file, {
				complete: (results: Papa.ParseResult<string[]>) => {
					const emails = results.data
						.flat()
						.filter((email: string) => email.includes("@"));

					addReviewersMutation.mutate(emails);
				},
				error: (error) => {
					console.error("Error parsing CSV:", error);
					toast.error("Failed to parse CSV file. Please check the file format.");
				},
			});
		}
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept=".csv"
				className="hidden"
			/>
			<Button
				type="button"
				size="xs"
				variant="secondary"
				className="text-xs"
				onClick={handleButtonClick}
				disabled={addReviewersMutation.isPending}
			>
				{addReviewersMutation.isPending ? "Uploading..." : "Upload CSV"}
			</Button>
		</div>
	);
}

function RemoveAllReviewers(props: ReviewersFormInputProps) {
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const mutation = useMutation({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/reviewers/all`,
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
			queryClient.invalidateQueries({ queryKey: ["reviewers"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
			props.form.setValue("reviewers", []);
			toast.success("Removed all reviewers");
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to remove email. Please try again.");
		},
	});

	const onConfirm = () => mutation.mutate();

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					type="button"
					size={"xs"}
					variant={"destructive"}
					className="text-xs"
					disabled={mutation.isPending}
				>
					Remove All Reviewers
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to remove all reviewers?
					</AlertDialogTitle>
					<AlertDialogDescription>
						Please confirm that you want to remove all reviewers from the newsletter.
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

function ReviewersInput(props: ReviewersFormInputProps) {
	const queryClient = useQueryClient();

	const [parent] = useAutoAnimate();

	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate: removeMutate } = useMutation<string[], APIError, string>({
		mutationFn: async (email: string) => {
			const escapedEmail = encodeURIComponent(email);
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/reviewers/${escapedEmail}`,
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
			queryClient.invalidateQueries({ queryKey: ["reviewers"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to remove email. Please try again.");
		},
	});

	const handleRemoveReviewer = (email: string) => {
		props.form.setValue(
			"reviewers",
			props.form.getValues().reviewers.filter((r) => r !== email),
		);

		removeMutate(email);
	};

	return (
		<FormField
			control={props.form.control}
			name="reviewers"
			render={({ field }) => {
				return (
					<FormItem>
						<FormLabel className="sr-only">Newsletter Reviewers</FormLabel>
						<FormControl>
							<div className="flex flex-wrap items-center gap-1" ref={parent}>
								{field.value.map((email) => (
									<Badge key={email} className="hover:bg-primary">
										{email}
										<Button
											type="button"
											onClick={() => handleRemoveReviewer(email)}
											className="-mr-1 ml-1 h-5 rounded-full p-1 hover:bg-accent/20 hover:text-primary-foreground"
											variant="ghost"
										>
											<X className={" h-3 w-3"} />
										</Button>
									</Badge>
								))}
							</div>
						</FormControl>
					</FormItem>
				);
			}}
		/>
	);
}

const emailSchema = z.string().email("Invalid email address");

function NewReviewerInput(props: ReviewersFormInputProps) {
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate: addMutate } = useMutation<string[], APIError, string[]>({
		mutationFn: async (emails: string[]) => {
			const results = await Promise.all(
				emails.map(async (email) => {
					const escapedEmail = encodeURIComponent(email.trim());
					const res = await authenticatedFetch(
						`${import.meta.env.VITE_API_URL}/api/reviewers/${escapedEmail}`,
						{
							method: "POST",
						},
					);

					if (!res.ok) {
						const errorData = await res.json().catch(() => null);
						throw APIError.fromResponse(res, errorData);
					}

					return await res.json();
				}),
			);
			return results;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reviewers"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to add email. Please try again.");
		},
	});

	const handleClickAdd = (
		e:
			| React.MouseEvent<HTMLButtonElement>
			| React.KeyboardEvent<HTMLInputElement>,
	) => {
		e.preventDefault();

		const values = props.form.getValues();
		const newReviewerInput = values["new-reviewer"];
		const existingReviewers = values.reviewers;

		if (!newReviewerInput) return false;

		const newEmails = newReviewerInput.split(",").map((email) => email.trim());
		const validNewEmails = newEmails.filter((email) => {
			const validationResult = emailSchema.safeParse(email);
			if (!validationResult.success) {
				toast.error(`Invalid email: ${email}`);
				return false;
			}
			return !existingReviewers.includes(email);
		});

		if (validNewEmails.length === 0) {
			return false;
		}

		addMutate(validNewEmails);

		props.form.setValue("reviewers", [...existingReviewers, ...validNewEmails]);
		props.form.setValue("new-reviewer", "");
	};

	return (
		<FormField
			control={props.form.control}
			name="new-reviewer"
			render={({ field }) => {
				return (
					<FormItem>
						<FormLabel className="sr-only">New Reviewer</FormLabel>
						<FormControl>
							<div className="flex items-center">
								<Input
									type="email"
									value={field.value}
									onChange={field.onChange}
									placeholder="Enter email address"
									className="flex-grow"
									onKeyDown={(e) => {
										if (e.key === "Enter") handleClickAdd(e);
									}}
								/>
								<Button type="button" onClick={handleClickAdd}>
									Add
								</Button>
							</div>
						</FormControl>
					</FormItem>
				);
			}}
		/>
	);
}
