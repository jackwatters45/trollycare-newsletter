import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { APIError } from "../lib/error";
import { AlertCircle } from "lucide-react";

interface ErrorProps {
	error?: APIError | Error | string;
}

export default function ErrorComponent({ error }: ErrorProps) {
	let errorMessage: string;
	let statusCode: number | undefined;

	if (typeof error === "object" && error !== null) {
		if ("statusCode" in error && "statusText" in error) {
			const apiError = error as APIError;
			errorMessage = `${apiError.message} (Status: ${apiError.statusCode} ${apiError.statusText})`;
			statusCode = apiError.statusCode;
		} else if (error instanceof Error) {
			errorMessage = error.message;
		} else {
			errorMessage = String(error);
		}
	} else if (typeof error === "string") {
		errorMessage = error;
	} else {
		errorMessage = "An unknown error occurred";
	}

	return (
		<div className="flex items-center justify-center py-16">
			<Alert variant="destructive" className="max-w-md">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>
					Error {statusCode !== undefined ? statusCode : "500"}
				</AlertTitle>
				<AlertDescription>{errorMessage}</AlertDescription>
			</Alert>
		</div>
	);
}
