import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const NotFoundPage = () => {
	return (
		<div className="flex flex-col items-center justify-center py-16 bg-background text-foreground">
			<h1 className="text-4xl font-bold mb-4">404</h1>
			<p className="text-xl mb-8">Oops! Page not found</p>
			<div className="mb-8">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="120"
					height="120"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="text-muted-foreground"
				>
					<title>404</title>
					<circle cx="12" cy="12" r="10" />
					<path d="M16 16s-1.5-2-4-2-4 2-4 2" />
					<line x1="9" y1="9" x2="9.01" y2="9" />
					<line x1="15" y1="9" x2="15.01" y2="9" />
				</svg>
			</div>
			<p className="text-center mb-8 max-w-md">
				The page you are looking for might have been removed, had its name
				changed, or is temporarily unavailable.
			</p>
			<Link to="/">
				<Button>Return to Home</Button>
			</Link>
		</div>
	);
};

export default NotFoundPage;
