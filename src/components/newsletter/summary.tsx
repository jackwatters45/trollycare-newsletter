import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { APIError } from "@/lib/error";
import type { Newsletter } from "@/types";

import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useAuthenticatedFetch } from "@/lib/auth";

export default function Summary(props: {
	initial: string;
	newsletterId: string;
}) {
	const authenticatedFetch = useAuthenticatedFetch();

	const [summary, setSummary] = useState(props.initial);

	const [isEditing, setIsEditing] = useState(false);

	const { mutate } = useMutation<Newsletter, APIError>({
		mutationFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/${props.newsletterId}/summary`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						summary,
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
			console.error(error);
			toast.error("Failed to update summary. Please try again.");
		},
	});

	const handleSaveClick = useCallback(() => {
		mutate();
		setIsEditing(false);
	}, [mutate]);

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
							<Button size={"sm"} variant={"secondary"} onClick={handleSaveClick}>
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
