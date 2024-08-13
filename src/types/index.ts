export interface Newsletter {
	id: string;
	status: "SENT" | "DRAFT" | "FAILED" | null;
	summary: string;
	sendAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface Category {
	name: string;
	articles: Article[];
}

export interface PopulatedNewsletter extends Newsletter {
	recipients: Recipient[];
	categories: Category[];
}

export interface Article {
	id: string;
	title: string;
	link: string;
	description: string;
	categoryId: string;
	createdAt: string;
	updatedAt: string;
}

export interface Recipient {
	email: string;
}
