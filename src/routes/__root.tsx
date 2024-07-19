// __root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<div className="w-full h-full">
				<div className="container py-16 space-y-8 max-w-screen-lg mx-auto">
					<Nav />
					<main className="flex-1">
						<Outlet />
					</main>
				</div>
				<Footer />
			</div>
			<Toaster />
			<TanStackRouterDevtools initialIsOpen={false} />
			<ReactQueryDevtools initialIsOpen={false} />
		</>
	);
}
