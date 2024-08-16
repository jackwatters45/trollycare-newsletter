// routes/update-password.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { APP_NAME } from "@/lib/constants";
import Loading from "@/components/loading";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/update-password")({
	component: UpdatePassword,
});

const formSchema = z
	.object({
		password: z.string().min(6, {
			message: "Password must be at least 6 characters.",
		}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});
type FormSchema = z.infer<typeof formSchema>;

function UpdatePassword() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isValidToken, setIsValidToken] = useState(false);

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	useEffect(() => {
		const handlePasswordReset = async () => {
			const hashParams = new URLSearchParams(window.location.hash.slice(1));
			const accessToken = hashParams.get("access_token");
			const refreshToken = hashParams.get("refresh_token");

			if (accessToken && refreshToken) {
				try {
					const { error } = await supabase.auth.setSession({
						access_token: accessToken,
						refresh_token: refreshToken,
					});
					if (error) throw error;
					setIsValidToken(true);
				} catch (error) {
					console.error("Error setting session:", error);
					setError(
						"Invalid or expired reset link. Please request a new password reset.",
					);
				}
			} else {
				setError("No reset token found. Please request a new password reset.");
			}
			setIsLoading(false);
		};

		handlePasswordReset();
	}, []);

	async function onSubmit(values: FormSchema) {
		try {
			const { error } = await supabase.auth.updateUser({
				password: values.password,
			});
			if (error) throw error;
			navigate({ to: "/login" });
		} catch (error) {
			if (error instanceof Error || error instanceof AuthError) {
				setError(error.message);
			} else {
				setError("Something went wrong. Please try again.");
			}
		}
	}

	if (isLoading) return <Loading />;

	if (!isValidToken) return navigate({ to: "/reset-password" });

	return (
		<div className="max-w-lg mx-auto space-y-4">
			<h1 className="text-2xl font-bold">{APP_NAME}</h1>
			<div className="space-y-2">
				<h2 className="text-lg font-bold">Update Password</h2>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm New Password</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							Update Password
						</Button>
					</form>
				</Form>
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				<div className="flex justify-center pt-2">
					<Link
						to="/login"
						className="text-gray-500 underline text-xs hover:text-gray-400"
					>
						Know your password? Sign in
					</Link>
				</div>
			</div>
		</div>
	);
}
