import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "./auth";
import { APIError } from "./error";
import type { Recipient } from "@/types";

export function useGetRecipients() {
	const authenticatedFetch = useAuthenticatedFetch();
	return useQuery({
		queryKey: ["recipients"],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/recipients`,
			);

			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}

			const recipients = (await res.json()) as Recipient[];

			return recipients.map((r) => r.email);
		},
	});
}
