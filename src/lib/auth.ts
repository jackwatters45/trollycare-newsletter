// src/lib/auth.ts
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export function useAuthenticatedFetch() {
	const { getToken } = useKindeAuth();

	return async (input: RequestInfo, init?: RequestInit) => {
		const token = await getToken();
		const headers = new Headers(init?.headers);
		headers.set("Authorization", `Bearer ${token}`);

		return fetch(input, { ...init, headers });
	};
}
