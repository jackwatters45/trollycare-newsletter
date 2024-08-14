// __root.tsx
import { createRootRoute, Outlet, useRouter } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import Nav from "@/components/nav";

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
				<div className="container py-16  max-w-screen-lg mx-auto">
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

function Footer() {
	return (
		<footer className="h-12 border-t border-border w-full text-sm text-muted-foreground fixed bottom-0 z-10 bg-background">
			<div className="mx-auto h-full flex items-center justify-between max-w-screen-lg px-8">
				<div className="flex items-center gap-8">
					{/* <Link className="hover:underline hover:opacity-90" to="/about">
						About
					</Link>
					<Link className="hover:underline hover:opacity-90" to="/resources">
						Resources
					</Link> */}
				</div>
				<div className="flex items-center gap-4">
					<a href="https://trollycare.com">&copy;TrollyCare</a>
					<div>{new Date().getFullYear()}</div>
				</div>
			</div>
		</footer>
	);
}
