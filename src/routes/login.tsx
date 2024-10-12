import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { supabase, useAuth } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError } from "@supabase/supabase-js";

export const Route = createFileRoute("/login")({
	component: Login,
});

const formSchema = z.object({
	email: z
		.string()
		.email({
			message: "Please enter a valid email address.",
		})
		.transform((value) => value.toLowerCase()),
	password: z.string().min(6, {
		message: "Password must be at least 6 characters.",
	}),
});

function Login() {
	const { session } = useAuth();
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email: values.email,
				password: values.password,
			});
			if (error) throw error;
		} catch (error) {
			if (error instanceof Error || error instanceof AuthError) {
				setError(error.message);
			} else {
				setError("Something went wrong. Please try again.");
			}
		}
	}

	if (session) {
		return <Navigate to="/" />;
	}

	return (
		<div className="max-w-lg mx-auto space-y-4">
			<h1 className="text-2xl font-bold">{APP_NAME}</h1>
			<div className="space-y-2">
				<h2 className="text-lg font-bold">Sign In</h2>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="Enter your email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="Enter your password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							Sign In
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
						to="/reset-password"
						className="text-gray-500 underline text-xs hover:text-gray-400"
					>
						Forgot your password?
					</Link>
				</div>
			</div>
		</div>
	);
}
