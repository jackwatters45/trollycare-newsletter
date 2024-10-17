import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { APIError } from "@/lib/error";
import type { Newsletter } from "@/types";

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
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { useAuthenticatedFetch } from "@/lib/auth";
import { useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "../ui/accordion";

export default function ConfirmSendAlert({
	newsletterId,
}: { newsletterId: string }) {
	const queryClient = useQueryClient();

	const authenticatedFetch = useAuthenticatedFetch();

	const mutation = useMutation<Newsletter, APIError>({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/${newsletterId}/send`,
				{
					method: "POST",
				},
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return await res.json();
		},
		onError: () => {
			toast.error("Failed to send newsletter. Please try again.");
		},
		onSuccess: () => {
			toast.success("Newsletter sent successfully");
			queryClient.invalidateQueries({ queryKey: ["newsletters"] });
			queryClient.invalidateQueries({ queryKey: ["article", newsletterId] });
		},
	});

	const onConfirm = () => mutation.mutate();

	const [isSynced, setIsSynced] = useState(false);

	const goBack = () => setIsSynced(false);

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button>Confirm Newsletter</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				{isSynced ? (
					<>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Are you sure the newsletter is ready to be sent?
							</AlertDialogTitle>
							<AlertDialogDescription>
								This will send the newsletter to your clients. Please verify that all
								articles are up to standard.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter className="flex flex-row items-center justify-between sm:justify-between">
							<Button
								variant={"ghost"}
								onClick={goBack}
								className="-translate-x-2 flex items-center gap-2 text-black"
							>
								<ArrowLeft className="h-4 w-4" />
								<span>Back</span>
							</Button>
							<div className="flex items-center gap-2">
								<AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={onConfirm} disabled={mutation.isPending}>
									{mutation.isPending ? "Sending..." : "Confirm"}
								</AlertDialogAction>
							</div>
						</AlertDialogFooter>
					</>
				) : (
					<SyncArticles setIsSynced={setIsSynced} />
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
}

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

function SyncArticles({
	setIsSynced,
}: {
	setIsSynced: (isSynced: boolean) => void;
}) {
	const [file, setFile] = useState<File | null>(null);

	const authenticatedFetch = useAuthenticatedFetch();

	const mutation = useMutation({
		mutationFn: async (file: File) => {
			const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

			for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
				const chunk = file.slice(
					chunkIndex * CHUNK_SIZE,
					(chunkIndex + 1) * CHUNK_SIZE,
				);

				const formData = new FormData();
				formData.append("file", chunk, file.name);
				formData.append("chunkIndex", chunkIndex.toString());
				formData.append("totalChunks", totalChunks.toString());

				const res = await authenticatedFetch(
					`${import.meta.env.VITE_API_URL}/api/recipients/sync`,
					{
						body: formData,
						method: "POST",
					},
				);

				if (!res.ok) {
					const errorData = await res.json().catch(() => null);
					throw APIError.fromResponse(res, errorData);
				}
			}
		},
		onError: (error) => {
			toast.dismiss();
			toast.error(error.message ?? "Failed to upload CSV file. Please try again.");
		},
		onSuccess: () => {
			toast.dismiss();
			toast.success("CSV file uploaded and data synced successfully!");
			setIsSynced(true);
		},
	});

	const handleUpload = async () => {
		if (!file) {
			toast.error("Please upload updated user data before proceeding.");
			return;
		}

		mutation.mutate(file);

		toast.loading("Uploading CSV file...");
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setFile(file);
		}
	};

	const handleSkip = () => {
		setIsSynced(true);
		setFile(null); // Reset file state
	};

	return (
		<>
			<AlertDialogHeader>
				<AlertDialogTitle>Sync Your User Data with Epic</AlertDialogTitle>
				<AlertDialogDescription>
					Before sending your newsletter, you should sync your user data with Epic.
					If you are already logged in to Epic, click{" "}
					<a
						className="underline"
						href="https://marketingautomation.myappliedproducts.com/lists/178122"
					>
						here
					</a>{" "}
					to navigate to the list of clients where you can download the CSV file.
				</AlertDialogDescription>
				<Accordion type="single" collapsible>
					<AccordionItem value="item-1">
						<AccordionTrigger className="text-sm">Instructions</AccordionTrigger>
						<AccordionContent>
							<ol className="list-decimal space-y-2 pl-4">
								<li>Navigate to the "Marketing Automation" tab in Epic.</li>
								<li>Navigate to the "Lists".</li>
								<li>Click on the "TrollyCare Home Care Clients" list.</li>
								<li>Click on the "Export to CSV" button.</li>
								<li>Once the file is downloaded, upload it to the newsletter below.</li>
							</ol>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</AlertDialogHeader>
			<Label htmlFor="csv-file" className="sr-only">
				Select CSV File
			</Label>
			<div className="space-y-2">
				<Input
					id="csv-file"
					type="file"
					accept=".csv"
					onChange={handleFileChange}
					disabled={mutation.isPending}
				/>
			</div>
			<Button
				onClick={handleUpload}
				disabled={!file || mutation.isPending}
				className="w-full"
			>
				{mutation.isPending ? (
					<>
						<Upload className="mr-2 h-4 w-4" />
						Uploading...
					</>
				) : file ? (
					<>
						<Upload className="mr-2 h-4 w-4" />
						Upload and Sync CSV
					</>
				) : (
					<>
						<Upload className="mr-2 h-4 w-4" />
						Click "Choose File" to upload CSV
					</>
				)}
			</Button>
			<Button onClick={handleSkip} className="w-full" variant="destructive">
				Skip Updating Data
			</Button>
		</>
	);
}
