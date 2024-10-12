import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { APIError } from "@/lib/error";

import { Button } from "../ui/button";
import { useAuthenticatedFetch } from "@/lib/auth";
import type { PopulatedNewsletter } from "@/types";
import { NewsletterPreview } from "./preview";

export default function GetHTML(
	props: {
		newsletterId: string;
	} & PopulatedNewsletter,
) {
	const authenticatedFetch = useAuthenticatedFetch();

	const { mutate } = useMutation<string, APIError>({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/${props.newsletterId}/get-html`,
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			return await res.json();
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to get HTML. Please try again.");
		},
		onSuccess: async (html) => {
			navigator.clipboard
				.writeText(html)
				.then(() => {
					toast.success("Copied HTML to clipboard");
				})
				.catch((err) => {
					console.error("Failed to copy: ", err);
					toast.error("Failed to copy HTML to clipboard");
				});
		},
	});

	const getHTML = () => mutate();


	

	return (
		<div>
			<Button variant="secondary" onClick={getHTML}>
				Copy HTML
			</Button>
			<div className="hidden">
				<NewsletterPreview
					sendDate={props.createdAt}
					summary={props.summary}
					categories={props.categories}
					ads={props.ads}
				/>
			</div>
		</div>
	);
}
