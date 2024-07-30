// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import {
	useEffect,
	useState,
	createContext,
	useContext,
	type ReactNode,
} from "react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

interface AuthContextType {
	session: Session | null;
	loading: boolean;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const auth = useAuthBase();

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

function useAuthBase() {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		supabase.auth
			.getSession()
			.then(({ data: { session } }) => setSession(session));
		setLoading(false);

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, []);

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	};

	return { session, loading, logout };
}

export function useAuthenticatedFetch() {
	const { session } = useAuth();

	return async (input: RequestInfo, init?: RequestInit) => {
		if (!session) {
			throw new Error("No active session");
		}

		try {
			// Refresh the session to ensure we have the most up-to-date access token
			const { data, error } = await supabase.auth.refreshSession();

			if (error) {
				throw error;
			}

			if (!data.session) {
				throw new Error("Failed to refresh session: No session data");
			}

			const headers = new Headers(init?.headers);
			headers.set("Authorization", `Bearer ${data.session.access_token}`);

			return fetch(input, { ...init, headers });
		} catch (error) {
			console.error("Error in authenticatedFetch:", error);
			throw error;
		}
	};
}
