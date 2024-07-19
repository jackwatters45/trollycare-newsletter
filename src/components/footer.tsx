export default function Footer() {
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
