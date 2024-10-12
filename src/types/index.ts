export interface Newsletter {
	id: string;
	mailChimpId?: string;
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

export interface Ad {
	id: string;
	title: string;
	link: string;
	company: string;
	description?: string;
	imageUrl?: string;
	order: number;
	type: "BANNER" | "INLINE";
}

export interface PopulatedNewsletter extends Newsletter {
	recipients: Recipient[];
	categories: Category[];
	ads: Ad[];
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

export interface ImportedRecipient {
	"Contact Name": string;
	"Email Address": string;
	"Client Type": string;
	"Contact Type": string;
	"Contact Description": string;
	"Account Name": string;
	"Primary Contact": string;
	Status: string;
	"Excluded Reason": string;
	"Client Portal Access": string;
}

export interface Recipient {
	id: string;
	contactId: string;
	fullName: string;
	email: string;
	status: string;
}

export interface Reviewer {
	id: number;
	email: string;
}
