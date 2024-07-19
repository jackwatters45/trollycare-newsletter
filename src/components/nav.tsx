import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { memo, useCallback } from "react";

const NavItems = memo(({ logout }: { logout: () => void }) => (
	<>
		<Link to="/">
			<Button size="sm" variant="ghost" type="button">
				Home
			</Button>
		</Link>
		<Link to="/history">
			<Button size="sm" variant="ghost" type="button">
				History
			</Button>
		</Link>
		<Button size="sm" variant="ghost" onClick={logout} type="button">
			Sign out
		</Button>
	</>
));
NavItems.displayName = "NavItems";

export default function Nav() {
	const auth = useKindeAuth();

	const handleLogout = useCallback(() => {
		auth.logout();
	}, [auth]);

	const handleLogin = useCallback(() => {
		auth.login();
	}, [auth]);

	return (
		<nav className="flex items-center justify-between p-4">
			<Link to="/" className="text-lg font-bold hover:no-underline">
				TrollyCare Newsletter
			</Link>

			{/* Desktop Navigation */}
			<div className="hidden xs:flex items-center space-x-2">
				{auth.isAuthenticated ? (
					<NavItems logout={handleLogout} />
				) : (
					<Button size="sm" variant="ghost" onClick={handleLogin} type="button">
						Sign In
					</Button>
				)}
			</div>

			{/* Mobile Navigation */}
			<Sheet>
				<SheetTrigger asChild className="xs:hidden">
					<Button variant="ghost" size="icon">
						<Menu className="h-6 w-6" />
					</Button>
				</SheetTrigger>
				<SheetContent>
					<div className="flex flex-col space-y-4 mt-4">
						{auth.isAuthenticated ? (
							<NavItems logout={handleLogout} />
						) : (
							<Button
								size="sm"
								variant="ghost"
								onClick={handleLogin}
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
