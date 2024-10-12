import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";

const NavItems = memo(
	({ logout, closeSheet }: { logout: () => void; closeSheet: () => void }) => (
		<>
			<Link to="/">
				<Button
					variant="ghost"
					type="button"
					className="w-full justify-start text-foreground"
					onClick={closeSheet}
				>
					Home
				</Button>
			</Link>
			<Link to="/generate">
				<Button
					variant="ghost"
					type="button"
					className="w-full justify-start text-foreground"
					onClick={closeSheet}
				>
					Generate
				</Button>
			</Link>
			<Link to="/history">
				<Button
					variant="ghost"
					type="button"
					className="w-full justify-start text-foreground"
					onClick={closeSheet}
				>
					History
				</Button>
			</Link>
			<Link to="/recipients">
				<Button
					variant="ghost"
					type="button"
					className="w-full justify-start text-foreground"
					onClick={closeSheet}
				>
					Recipients
				</Button>
			</Link>
			<Button
				variant="ghost"
				onClick={() => {
					logout();
					closeSheet();
				}}
				type="button"
				className="w-full justify-start text-foreground"
			>
				Sign out
			</Button>
		</>
	),
);
NavItems.displayName = "NavItems";

export default function Nav() {
	const [isOpen, setIsOpen] = useState(false);
	const { session, logout } = useAuth();

	const handleLogout = () => logout();

	const closeSheet = useCallback(() => {
		setIsOpen(false);
	}, []);

	return (
		<div className="fixed z-50 w-full border-border border-b bg-background shadow-sm">
			<nav className="mx-auto flex h-12 max-w-screen-lg items-center justify-between px-4 py-1">
				<Link to="/" className="font-bold text-lg hover:no-underline">
					{APP_NAME}
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden items-center space-x-2 md:flex">
					{session ? (
						<NavItems logout={handleLogout} closeSheet={closeSheet} />
					) : (
						<Link to="/login" className="text-foreground">
							<Button size="sm" variant="ghost" type="button">
								Sign In
							</Button>
						</Link>
					)}
				</div>

				{/* Mobile Navigation */}
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild className="md:hidden">
						<Button variant="ghost" size="icon">
							<Menu className="h-5 w-5" />
						</Button>
					</SheetTrigger>
					<SheetContent>
						<div className="mt-4 flex flex-col space-y-2">
							{session ? (
								<NavItems logout={handleLogout} closeSheet={closeSheet} />
							) : (
								<Link to="/login">
									<Button
										size="sm"
										variant="ghost"
										onClick={() => closeSheet}
										type="button"
									>
										Sign In
									</Button>
								</Link>
							)}
						</div>
					</SheetContent>
				</Sheet>
			</nav>
		</div>
	);
}
