import type React from "react";
import Loading from "./loading";
import { useAuth } from "@/lib/auth";
import { Navigate } from "@tanstack/react-router";

export function withProtectedRoute<P extends object>(
	WrappedComponent: React.ComponentType<P>,
) {
	return function ProtectedRoute(props: P) {
		const { session, loading } = useAuth();

		if (loading) {
			return <Loading />;
		}

		if (!session) {
			return <Navigate to="/login" />;
		}

		return <WrappedComponent {...props} />;
	};
}
