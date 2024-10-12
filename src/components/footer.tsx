import { Link } from "@tanstack/react-router";

export default function Footer() {
	return (
		<footer className="fixed bottom-0 z-50 h-12 w-full border-border border-t bg-background text-muted-foreground text-sm">
			<div className="mx-auto flex h-full max-w-screen-lg items-center justify-between px-8">
				<div className="flex items-center gap-8">
					<Link className="hover:underline hover:opacity-90" to="/example">
						Example
					</Link> 
				</div>
				<div className="flex items-center gap-4">
					<a href="https://trollycare.com">&copy;TrollyCare</a>
					<div>{new Date().getFullYear()}</div>
				</div>
			</div>
		</footer>
	);
}
