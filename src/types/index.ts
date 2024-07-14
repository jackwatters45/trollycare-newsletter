export interface ArticleDisplayData {
	title: string;
	link: string;
	description: string;
}

export interface Category {
	name: string;
	articles: ArticleDisplayData[];
}

export interface NewsletterData {
	categories: Category[] | undefined;
	summary: string;
}
