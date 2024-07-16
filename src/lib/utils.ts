import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RECURRING_FREQUENCY } from "./constants";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(emails: string[]) {
	return emails.filter((email) => email && emailRegex.test(email));
}

export function getPastWeekDate(endDate: Date | string): {
	start: string;
	end: string;
	year: number;
} {
	const pastWeek = new Date(endDate).getTime() - RECURRING_FREQUENCY;
	const formattedPastWeek = new Date(pastWeek).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const today = new Date();
	const formattedToday = new Date(today).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return {
		start: formattedPastWeek,
		end: formattedToday,
		year: today.getFullYear(),
	};
}
