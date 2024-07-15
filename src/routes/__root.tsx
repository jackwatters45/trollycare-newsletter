import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
	component: () => (
		<>
			<div className="w-full h-full">
				<div className="container mx-auto max-w-screen-sm py-16 space-y-8">
					<Outlet />
				</div>
			</div>
			<Toaster />
			<TanStackRouterDevtools />
		</>
	),
});
