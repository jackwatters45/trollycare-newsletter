import type React from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import Loading from "./loading";

export function withProtectedRoute<P extends object>(
	WrappedComponent: React.ComponentType<P>,
) {
	return function ProtectedRoute(props: P) {
		const auth = useKindeAuth();

		if (auth.isLoading) {
			return <Loading />;
		}

		if (!auth.isAuthenticated) {
			auth.login();
			return null;
		}

		return <WrappedComponent {...props} />;
	};
}
