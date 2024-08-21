import "../globals.css";

import type { Meta, StoryObj } from "@storybook/react";
import type { Ad } from "@/types";
import AdComponent from "@/components/ad";

const meta: Meta<typeof AdComponent> = {
	title: "Components/Ad",
	component: AdComponent,
	tags: ["autodocs"],
	argTypes: {
		id: { control: "number" },
		title: { control: "text" },
		description: { control: "text" },
		link: { control: "text" },
		imageUrl: { control: "text" },
		type: { control: "select", options: ["BANNER", "INLINE"] },
		company: { control: "text" },
		order: { control: "number" },
	},
};

export default meta;
type Story = StoryObj<typeof AdComponent>;

const defaultAd: Ad = {
	id: "1",
	title: "New Revolutionary Home Care Device",
	description:
		"Discover how our latest innovation is changing the landscape of home care.",
	link: "https://example.com/homecare-device",
	imageUrl: "https://via.placeholder.com/800x200",
	type: "BANNER",
	company: "TechCare Solutions",
	order: 1,
};

export const BannerWithImage: Story = {
	args: {
		...defaultAd,
	},
};

export const InlineWithImage: Story = {
	args: {
		...defaultAd,
		id: "2",
		type: "INLINE",
		imageUrl: "https://via.placeholder.com/400x300",
	},
};

export const BannerWithoutImage: Story = {
	args: {
		...defaultAd,
		id: "3",
		imageUrl: undefined,
		title: "Join Our Webinar: Future of Home Healthcare",
		description: "Learn about upcoming trends and technologies in home care.",
		company: "HealthTech Institute",
	},
};

export const InlineWithoutImage: Story = {
	args: {
		...defaultAd,
		id: "4",
		type: "INLINE",
		imageUrl: undefined,
		title: "Special Offer on Home Care Supplies",
		description:
			"Get 20% off on all medical supplies this week. Limited time offer!",
		company: "MediSupply Co.",
	},
};

export const BannerWithoutDescription: Story = {
	args: {
		...defaultAd,
		id: "5",
		description: undefined,
		title: "Revolutionary AI-Powered Home Care Assistant",
	},
};

export const InlineWithLongDescription: Story = {
	args: {
		...defaultAd,
		id: "6",
		type: "INLINE",
		title: "Comprehensive Home Care Training",
		description:
			"Join our intensive 4-week program designed to equip caregivers with advanced skills in patient care, emergency response, and holistic wellness approaches. Limited spots available!",
		company: "CareEducation Pro",
	},
};
