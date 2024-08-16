import { createFileRoute } from "@tanstack/react-router";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Auth } from "@supabase/auth-ui-react";
import { supabase, useAuth } from "@/lib/auth";
import { Navigate } from "@tanstack/react-router";
import { APP_NAME } from "@/lib/constants";

export const Route = createFileRoute("/login")({
	component: Login,
});

function Login() {
	const { session } = useAuth();

	if (session) {
		return <Navigate to="/" />;
	}

	return (
		<div className="max-w-lg mx-auto space-y-4">
			<h1 className="text-2xl font-bold">{APP_NAME}</h1>
			<div className="space-y-2">
				<h2 className="text-lg font-bold">Sign In</h2>
				<Auth
					supabaseClient={supabase}
					appearance={{
						theme: ThemeSupa,
						variables: {
							default: { colors: { brand: "black", brandAccent: "black" } },
						},
					}}
					providers={[]}
					view="sign_in"
					showLinks={false}
					localization={{
						variables: {
							sign_in: {
								email_label: "Email",
								password_label: "Password",
								button_label: "Sign In",
							},
						},
					}}
				/>
			</div>
		</div>
	);
}
