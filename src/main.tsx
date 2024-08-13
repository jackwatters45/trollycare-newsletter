// main.tsx
import "./globals.css";

import React from "react";
import * as Sentry from "@sentry/react";
import {
	ErrorComponent,
	RouterProvider,
	createRouter,
} from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider.tsx";
import NotFoundPage from "./components/not-found.tsx";
import { AuthProvider } from "./lib/auth.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
	routeTree,
	defaultNotFoundComponent: () => <NotFoundPage />,
	defaultErrorComponent: ({ error }: { error: Error }) => (
		<ErrorComponent error={error} />
	),
	context: { queryClient },
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

Sentry.init({
	dsn: "https://25881c8f3a123d600fb218dfe9063b1e@o4507179419238400.ingest.us.sentry.io/4507653649727488",
	integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
	// Performance Monitoring
	tracesSampleRate: 1.0, //  Capture 100% of the transactions
	// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
	tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
	// Session Replay
	replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
	replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

function InnerApp() {
	return <RouterProvider router={router} />;
}

function App() {
	return (
		<AuthProvider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
					<InnerApp />
					{import.meta.env.DEV && <ReactQueryDevtools />}
				</ThemeProvider>
			</QueryClientProvider>
		</AuthProvider>
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
