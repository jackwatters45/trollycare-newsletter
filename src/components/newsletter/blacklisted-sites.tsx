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

const blacklistedDomainsFormSchema = z.object({
	domains: z.array(z.string()),
	"new-domain": z.string(),
});

export type BlacklistedDomainsFormSchema = z.infer<
	typeof blacklistedDomainsFormSchema
>;

const domainSchema = z.string().url("Invalid url");

// TODO: wording
export default function BlacklistedDomainsForm(props: {
	blacklistedDomains: string[];
	newsletterId?: string;
}) {
	const form = useForm<z.infer<typeof blacklistedDomainsFormSchema>>({
		resolver: zodResolver(blacklistedDomainsFormSchema),
		defaultValues: {
			domains: props.blacklistedDomains,
			"new-domain": "",
		},
	});

	return (
		<Card className="p-6">
			<Form {...form}>
				<form className="space-y-8 container px-0 mx-auto">
					<div className="space-y-6">
						<h2 className="text-2xl font-bold">Blacklisted News Sources</h2>
						<FormDescription>
							These news sources will be ommited from the newsletter. You can add
							multiple news sources by separating them with a comma.
						</FormDescription>
					</div>
					<div className="space-y-4">
						<div className="flex justify-end items-center space-x-2">
							<CSVUpload form={form} newsletterId={props.newsletterId} />
							<RemoveAllBlacklistedDomains form={form} newsletterId={props.newsletterId} />
						</div>
						<NewReviewerInput form={form} newsletterId={props.newsletterId} />
						<BlacklistedDomainsInput form={form} newsletterId={props.newsletterId} />
					</div>
				</form>
			</Form>
		</Card>
	);
}

interface BlacklistedDomainsFormInputProps {
	form: UseFormReturn<BlacklistedDomainsFormSchema>;
	newsletterId?: string;
}

export function CSVUpload(props: BlacklistedDomainsFormInputProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const addBlacklistedDomainsMutation = useMutation<string[], APIError, string[]>({
		mutationFn: async (domains: string[]) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/blacklisted-domains/bulk`,
				{
					method: "POST",
					body: JSON.stringify({ domains }),
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		onSuccess: (addedDomains) => {
			queryClient.invalidateQueries({ queryKey: ["blacklisted-domains"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
			const currentBlacklistedDomains = props.form.getValues().domains;
			const newBlacklistedDomains = [...new Set([...currentBlacklistedDomains, ...addedDomains])];
			props.form.setValue("domains", newBlacklistedDomains);
			toast.success(`Added ${addedDomains.length} new domain(s)`);
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to add blacklisted domains. Please try again.");
		},
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log(event.target);
		const file = event.target.files?.[0];
		if (file) {
			Papa.parse(file, {
				complete: (results: Papa.ParseResult<string[]>) => {
					console.log(results);
					const domains = results.data
						.flat()
						.filter((domain: string) => domainSchema.safeParse(domain).success);

					addBlacklistedDomainsMutation.mutate(domains);
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
				disabled={addBlacklistedDomainsMutation.isPending}
			>
				{addBlacklistedDomainsMutation.isPending ? "Uploading..." : "Upload CSV"}
			</Button>
		</div>
	);
}

function RemoveAllBlacklistedDomains(props: BlacklistedDomainsFormInputProps) {
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const mutation = useMutation({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/blacklisted-domains/all`,
				{
					method: "DELETE",
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw new Error(errorData?.message);
			}

			return await res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blacklisted-domains"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
			props.form.setValue("domains", []);
			toast.success("Removed all blacklisted-domains");
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to remove domain. Please try again.");
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
					Remove All BlacklistedDomains
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you sure you want to remove all blacklisted domains?
					</AlertDialogTitle>
					<AlertDialogDescription>
						Please confirm that you want to remove all blacklisted domains from the
						newsletter.
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

function BlacklistedDomainsInput(props: BlacklistedDomainsFormInputProps) {
	const queryClient = useQueryClient();

	const [parent] = useAutoAnimate();

	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate: removeMutate } = useMutation<string[], APIError, string>({
		mutationFn: async (domain: string) => {
			const escapedDomain = encodeURIComponent(domain);
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/blacklisted-domains/${escapedDomain}`,
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
			queryClient.invalidateQueries({ queryKey: ["blacklisted-domains"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to remove domain. Please try again.");
		},
	});

	const handleRemoveReviewer = (domain: string) => {
		props.form.setValue(
			"domains",
			props.form.getValues().domains.filter((r) => r !== domain),
		);

		removeMutate(domain);
	};

	return (
		<FormField
			control={props.form.control}
			name="domains"
			render={({ field }) => {
				return (
					<FormItem>
						<FormLabel className="sr-only">Newsletter BlacklistedDomains</FormLabel>
						<FormControl>
							<div className="flex items-center flex-wrap gap-1" ref={parent}>
								{field.value.map((domain) => (
									<Badge key={domain} className="hover:bg-primary">
										{domain}
										<Button
											type="button"
											onClick={() => handleRemoveReviewer(domain)}
											className="ml-1 -mr-1 p-1 rounded-full h-5 hover:bg-accent/20 hover:text-primary-foreground"
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

function NewReviewerInput(props: BlacklistedDomainsFormInputProps) {
	const queryClient = useQueryClient();
	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate: addMutate } = useMutation<string[], APIError, string[]>({
		mutationFn: async (domains: string[]) => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/blacklisted-domains/bulk`,
				{
					method: "POST",
					body: JSON.stringify({ domains }),
					headers: { "Content-Type": "application/json" },
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();

		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blacklisted-domains"] });
			if (props.newsletterId) {
				queryClient.invalidateQueries({
					queryKey: ["newsletter", props.newsletterId],
				});
			}
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to add domain. Please try again.");
		},
	});

	const handleClickAdd = (
		e:
			| React.MouseEvent<HTMLButtonElement>
			| React.KeyboardEvent<HTMLInputElement>,
	) => {
		e.preventDefault();

		const values = props.form.getValues();
		const newReviewerInput = values["new-domain"];
		const existingBlacklistedDomains = values.domains;

		if (!newReviewerInput) return false;

		const newDomains = newReviewerInput.split(",").map((domain) => domain.trim());
		const validNewDomains = newDomains.filter((domain) => {
			const validationResult = domainSchema.safeParse(domain);
			if (!validationResult.success) {
				toast.error(`Invalid domain: ${domain}`);
				return false;
			}
			return !existingBlacklistedDomains.includes(domain);
		});

		if (validNewDomains.length === 0) {
			return false;
		}

		console.log(validNewDomains);

		addMutate(validNewDomains);

		props.form.setValue("domains", [...existingBlacklistedDomains, ...validNewDomains]);
		props.form.setValue("new-domain", "");
	};

	return (
		<FormField
			control={props.form.control}
			name="new-domain"
			render={({ field }) => {
				return (
					<FormItem>
						<FormLabel className="sr-only">New Domain</FormLabel>
						<FormControl>
							<div className="flex items-center">
								<Input
									type="url"
									value={field.value}
									onChange={field.onChange}
									placeholder="Enter domain"
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
