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

export default function ConfirmSendAlert({
	newsletterId,
}: { newsletterId: string }) {
	const queryClient = useQueryClient();

	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate } = useMutation<Newsletter, APIError>({
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
		onError: (error) => {
			console.log(error);
			toast.error("Failed to send newsletter. Please try again.");
		},
		onSuccess: () => {
			toast.success("Newsletter sent successfully");
			queryClient.invalidateQueries({ queryKey: ["newsletters"] });
			queryClient.invalidateQueries({ queryKey: ["article", newsletterId] });
		},
	});

	const onConfirm = () => mutate();

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
