// __root.tsx
import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	const router = useRouter();

	const pagesWithoutLayout = ["/login", "/reset-password", "/update-password", "/subscribe", "/unsubscribe"];

	const isAuthPage = pagesWithoutLayout.includes(router.state.location.pathname);

	return (
		<>
			<div className="h-full w-full">
				{!isAuthPage ? <Nav /> : null}
				<div className="container mx-auto max-w-screen-lg pt-24 pb-16">
					<main className="flex-1 space-y-8">
						<Outlet />
					</main>
				</div>
				{!isAuthPage ? <Footer /> : null}
			</div>
			<Toaster />
		</>
	);
}
