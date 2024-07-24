export interface Newsletter {
	id: string;
	status: "SENT" | "DRAFT" | "FAILED" | null;
	categories: Category[];
	summary: string;
	sendAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface NewsletterWithRecipients extends Newsletter {
	recipients: Recipient[];
}

export interface Category {
	id: string;
	name: string;
	articles: Article[];
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
