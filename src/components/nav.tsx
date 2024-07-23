import { useState, useCallback, memo } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";

const NavItems = memo(
	({ logout, closeSheet }: { logout: () => void; closeSheet: () => void }) => (
		<>
			<Link to="/">
				<Button
					variant="ghost"
					type="button"
					className="w-full justify-start"
					onClick={closeSheet}
				>
					Home
				</Button>
			</Link>
			<Link to="/generate">
				<Button
					variant="ghost"
					type="button"
					className="w-full justify-start"
					onClick={closeSheet}
				>
					Generate
				</Button>
			</Link>
			<Link to="/history">
				<Button
					variant="ghost"
					type="button"
					className="w-full justify-start"
					onClick={closeSheet}
				>
					History
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
	const auth = useKindeAuth();
	const [isOpen, setIsOpen] = useState(false);

	const handleLogout = useCallback(() => {
		auth.logout();
	}, [auth]);

	const handleLogin = useCallback(() => {
		auth.login();
	}, [auth]);

	const closeSheet = useCallback(() => {
		setIsOpen(false);
	}, []);

	return (
		<nav className="flex items-center justify-between p-4">
			<Link to="/" className="text-lg font-bold hover:no-underline">
				TrollyCare Newsletter
			</Link>

			{/* Desktop Navigation */}
			<div className="hidden sm:flex items-center space-x-2">
				{auth.isAuthenticated ? (
					<NavItems logout={handleLogout} closeSheet={closeSheet} />
				) : (
					<Button size="sm" variant="ghost" onClick={handleLogin} type="button">
						Sign In
					</Button>
				)}
			</div>

			{/* Mobile Navigation */}
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetTrigger asChild className="sm:hidden">
					<Button variant="ghost" size="icon">
						<Menu className="h-6 w-6" />
					</Button>
				</SheetTrigger>
				<SheetContent>
					<div className="flex flex-col space-y-2 mt-4">
						{auth.isAuthenticated ? (
							<NavItems logout={handleLogout} closeSheet={closeSheet} />
						) : (
							<Button
								size="sm"
								variant="ghost"
								onClick={() => {
									handleLogin();
									closeSheet();
								}}
								type="button"
							>
								Sign In
							</Button>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</nav>
	);
}
