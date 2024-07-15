import { APIError } from "@/lib/error";

export const getData = async (newsletterId: string) => {
	const res = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/newsletters/${newsletterId}`,
	);

	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		throw APIError.fromResponse(res, errorData);
	}

	return await res.json();
};

export const saveArticleDescription = async (
	articleId: string,
	description: string,
) => {
	const res = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/articles/${articleId}/description`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				description,
			}),
		},
	);
	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		throw APIError.fromResponse(res, errorData);
	}
	return await res.json();
};

export const removeArticle = async (articleId: string) => {
	const res = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/articles/${articleId}`,
		{
			method: "DELETE",
		},
	);
	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		throw APIError.fromResponse(res, errorData);
	}
	return await res.json();
};

export const sendNewsletter = async (newsletterId: string) => {
	const res = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/newsletters/${newsletterId}/send`,
		{
			method: "POST",
		},
	);
	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		throw APIError.fromResponse(res, errorData);
	}
	return await res.json();
};

export const updateSummary = async (newsletterId: string, summary: string) => {
	const res = await fetch(
		`${import.meta.env.VITE_BASE_URL}/api/newsletters/${newsletterId}/summary`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				summary,
			}),
		},
	);
	if (!res.ok) {
		const errorData = await res.json().catch(() => null);
		throw APIError.fromResponse(res, errorData);
	}
	return await res.json();
};
