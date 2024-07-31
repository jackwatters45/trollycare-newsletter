import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

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
		<nav className="flex items-center justify-between p-4">
			<Link to="/" className="text-lg font-bold hover:no-underline">
				TrollyCare Newsletter
			</Link>

			{/* Desktop Navigation */}
			<div className="hidden sm:flex items-center space-x-2">
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
				<SheetTrigger asChild className="sm:hidden">
					<Button variant="ghost" size="icon">
						<Menu className="h-5 w-5" />
					</Button>
				</SheetTrigger>
				<SheetContent>
					<div className="flex flex-col space-y-2 mt-4">
						{session ? (
							<NavItems logout={handleLogout} closeSheet={closeSheet} />
						) : (
							<Link to="/login">
								<Button
									size="sm"
									variant="ghost"
									onClick={() => closeSheet}
									type="button"
									// className="w-full justify-start"
								>
									Sign In
								</Button>
							</Link>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</nav>
	);
}
