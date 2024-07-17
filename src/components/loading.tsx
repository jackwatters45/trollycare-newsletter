import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex items-center justify-center py-16">
			<div className="text-center">
				<Loader2 className="h-8 w-8 animate-spin mx-auto" />
				<p className="mt-2 text-lg font-semibold">Loading...</p>
			</div>
		</div>
	);
}
