export const COMPANY_NAME = "TrollyCare";

export const APP_NAME = `${COMPANY_NAME} Newsletter`;

export const CATEGORIES = [
	"Industry Trends & Policy",
	"Clinical Research & Care Innovations",
	"Business Operations & Technology",
	"Caregiving Excellence: Support & Best Practices",
	"Other",
] as const;

export const PORT = import.meta.env.PORT || 8080;

export const CLIENT_PORT = import.meta.env.CLIENT_PORT || 5173;

export const IS_DEVELOPMENT = import.meta.env.NODE_ENV === "development";

export const API_URL = IS_DEVELOPMENT
	? `http://localhost:${PORT}`
	: "automated-homecare-newsletter-production.up.railway.app";

export const CLIENT_URL = IS_DEVELOPMENT
	? `http://localhost:${CLIENT_PORT}`
	: "https://trollycare-newsletter.vercel.app";
