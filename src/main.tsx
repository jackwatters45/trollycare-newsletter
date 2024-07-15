// main.tsx
import "./globals.css";
import React from "react";
import {
	ErrorComponent,
	RouterProvider,
	createRouter,
} from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import Loading from "./components/loading.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { AuthProvider, useAuth } from "./components/auth-provider";
import { ThemeProvider } from "./components/theme-provider.tsx";

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
	routeTree,
	defaultPendingComponent: () => <Loading />,
	defaultErrorComponent: ({ error }: { error: Error }) => (
		<ErrorComponent error={error} />
	),
	context: { auth: undefined, queryClient },
	defaultPreload: "intent",
	// Since we're using React Query, we don't want loader calls to ever be stale
	// This will ensure that the loader is always called when the route is preloaded or visited
	defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function InnerApp() {
	// const auth = useAuth();
	const auth = {};
	return <RouterProvider router={router} context={{ auth }} />;
}

// TODO: auth
function App() {
	return (
		// <AuthProvider>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
				<InnerApp />
			</ThemeProvider>
		</QueryClientProvider>
		// </AuthProvider>
	);
}

// Render the app
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}
