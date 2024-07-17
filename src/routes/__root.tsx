import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export const Route = createRootRoute({
	component: () => (
		<>
			<div className="w-full h-full">
				<div className="container py-16 space-y-8 max-w-md mx-auto">
					<Nav />
					<main>
						<Outlet />
					</main>
				</div>
			</div>
			<Toaster />
			<TanStackRouterDevtools initialIsOpen={false} />
			<ReactQueryDevtools initialIsOpen={false} />
		</>
	),
});

function Nav() {
	const auth = useKindeAuth();

	return (
		<nav className="flex items-center justify-between">
			<h1 className="text-2xl font-bold">TrollyCare Newsletter</h1>
			{auth.isAuthenticated ? (
				<button onClick={auth.logout} type="button">
					Sign out
				</button>
			) : (
				<button
					onClick={() =>
						auth.login({
							authUrlParams: {
								login_hint: "jenny@example.com",
								lang: "ru",
							},
						})
					}
					type="button"
				>
					Sign In
				</button>
			)}
		</nav>
	);
}
