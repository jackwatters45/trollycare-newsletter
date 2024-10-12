import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
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

export const Route = createFileRoute("/reset-password")({
	component: ResetPassword,
});

const formSchema = z.object({
	email: z
		.string()
		.email({
			message: "Please enter a valid email address.",
		})
		.transform((value) => value.toLowerCase()),
});

function ResetPassword() {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
				redirectTo: `${window.location.origin}/update-password`,
			});
			if (error) throw error;
			setIsSubmitted(true);
		} catch (error) {
			if (error instanceof Error || error instanceof AuthError) {
				setError(error.message);
			} else {
				setError("Something went wrong. Please try again.");
			}
		}
	}

	return (
		<div className="max-w-lg mx-auto space-y-4">
			<h1 className="text-2xl font-bold">{APP_NAME}</h1>
			<div className="space-y-2">
				<h2 className="text-lg font-bold">Reset Password</h2>
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
						<Button type="submit" className="w-full">
							Send Reset Instructions
						</Button>
					</form>
				</Form>
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				{isSubmitted && (
					<Alert variant="success">
						<AlertDescription>
							Check your email for the password reset link
						</AlertDescription>
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
