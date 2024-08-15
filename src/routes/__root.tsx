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
	const isLoginPage = router.state.location.pathname === "/login";

	return (
		<>
			<div className="w-full h-full">
				{!isLoginPage ? <Nav /> : null}
				<div className="container pb-16 pt-24 max-w-screen-lg mx-auto">
					<main className="flex-1 space-y-8">
						<Outlet />
					</main>
				</div>
				<Footer />
			</div>
			<Toaster />
		</>
	);
}
