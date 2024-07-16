export interface Newsletter {
	id: string;
	categories: Category[];
	summary: string;
	createdAt: string;
	updatedAt: string;
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
