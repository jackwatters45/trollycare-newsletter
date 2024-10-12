import { Loader2 } from "lucide-react";

export default function Loading({ text = "Loading..." }: { text?: string }) {
	return (
		<div className="flex items-center justify-center py-16">
			<div className="text-center">
				<Loader2 className="mx-auto h-8 w-8 animate-spin" />
				<p className="mt-2 font-semibold text-lg">{text}</p>
			</div>
		</div>
	);
}
