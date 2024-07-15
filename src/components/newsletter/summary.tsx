import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { APIError } from "@/lib/error";
import type { Newsletter } from "@/types";

import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { updateSummary } from "./actions";

export default function Summary(props: {
	initial: string;
	newsletterId: string;
}) {
	const [summary, setSummary] = useState(props.initial);

	const [isEditing, setIsEditing] = useState(false);

	const { mutate } = useMutation<Newsletter, APIError>({
		mutationFn: () => updateSummary(props.newsletterId, summary),
		onError: (error) => {
			console.log(error);
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
