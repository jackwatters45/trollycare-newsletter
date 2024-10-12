import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(emails: string[]) {
	return emails.filter((email) => email && emailRegex.test(email));
}

export function getPastWeekDate(
	endDate: Date | string,
	frequency: number,
): {
	start: string;
	end: string;
	year: number;
} {
	const pastWeek = new Date(endDate).getTime() - frequency;
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

export function truncateText(value: string, truncLength = 20) {
	return value.length > truncLength
		? `${value.slice(0, truncLength)}...`
		: value;
}

export function weeksToMilliseconds(weeks?: number): number | null {
	if (!weeks) return null;
	const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
	return weeks * MILLISECONDS_PER_WEEK;
}
