import { useAuthenticatedFetch } from "@/lib/auth";
import { APIError } from "@/lib/error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import ErrorComponent from "../error";
import Loading from "../loading";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditFrequency() {
	const authenticatedFetch = useAuthenticatedFetch();

	const { data, isLoading, error } = useQuery({
		queryKey: ["newsletters", "frequency"],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/frequency`,
			);
			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
	});

	if (isLoading) return <Loading />;
	if (error) return <ErrorComponent error={error} />;
	if (!data) return <ErrorComponent error="No data available" />;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Edit Newsletter Frequency</CardTitle>
				<CardDescription>
					Choose how often the newsletter should be generated
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FrequencyForm initialWeeks={data.weeks.toString()} />
			</CardContent>
		</Card>
	);
}

const formSchema = z.object({
	weeks: z.string().refine((val) => ["1", "2", "3", "4"].includes(val), {
		message: "Please select a valid number of weeks",
	}),
});
type FormValues = z.infer<typeof formSchema>;

function FrequencyForm({ initialWeeks }: { initialWeeks: string }) {
	const authenticatedFetch = useAuthenticatedFetch();
	const queryClient = useQueryClient();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			weeks: initialWeeks,
		},
	});

	const mutation = useMutation({
		mutationFn: async (weeks: string) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/frequency`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ weeks: Number.parseInt(weeks, 10) }),
				},
			);
			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		onSuccess: () => {
			toast.success("Newsletter frequency updated successfully");
			queryClient.invalidateQueries({
				queryKey: ["newsletters", "frequency"],
			});
			setSubmitError(null);
		},
		onError: (error) => {
			toast.error("Failed to update newsletter frequency");
			setSubmitError(
				error instanceof APIError ? error.message : "An error occurred",
			);
		},
	});

	const submitForm = (values: FormValues) => {
		mutation.mutate(values.weeks);
	};

	return (
		<Form {...form}>
			<form className="space-y-6" onSubmit={form.handleSubmit(submitForm)}>
				<FormField
					control={form.control}
					name="weeks"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Newsletter Frequency (in weeks)</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select frequency" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="1">1 week</SelectItem>
									<SelectItem value="2">2 weeks</SelectItem>
									<SelectItem value="3">3 weeks</SelectItem>
									<SelectItem value="4">4 weeks</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={mutation.isPending}>
					{mutation.isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save"
					)}
				</Button>
				{submitError && <FormMessage>{submitError}</FormMessage>}
			</form>
		</Form>
	);
}
