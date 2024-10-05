import { useAuthenticatedFetch } from "@/lib/auth";
import { CLIENT_URL, COMPANY_NAME } from "@/lib/constants";
import { APIError } from "@/lib/error";
import { getPastWeekDate, weeksToMilliseconds } from "@/lib/utils";
import type { Ad, Category } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import Loading from "../loading";
import ErrorComponent from "../error";

export function NewsletterPreview(props: {
	sendDate: string;
	summary: string;
	categories: Category[];
	ads: Ad[];
}) {
	const authenticatedFetch = useAuthenticatedFetch();
	const {
		data: frequency,
		isLoading,
		error,
	} = useQuery<{ weeks: number }>({
		queryKey: ["newsletters", "frequency"],
		queryFn: async () => {
			const res = await authenticatedFetch(
				`${import.meta.env.VITE_API_URL}/api/newsletters/frequency`,
			);
			if (!res.ok) {
				const errorData = await res.json().catch(() => null);
				throw APIError.fromResponse(res, errorData);
			}
			return await res.json();
		},
		refetchOnWindowFocus: false,
	});

	const frequencyMS = weeksToMilliseconds(frequency?.weeks);
	const dates = useMemo(() => {
		if (!frequencyMS) return null;
		return getPastWeekDate(new Date(props.sendDate), frequencyMS);
	}, [props.sendDate, frequencyMS]);

	if (isLoading) return <Loading />;
	if (error) return <ErrorComponent error={error} />;

	if (!dates) return <ErrorComponent error="Could not load dates" />;

	return (
		<div
			id="newsletter-preview"
			className="mx-auto max-w-[600px] bg-white p-5 font-sans text-slate-900 leading-relaxed"
		>
			<div className="border-slate-200 border-b-2 pb-3">
				<table className="w-full">
					<tbody>
						<tr>
							<td className="text-left align-middle">
								<h1 className="font-bold text-black text-lg">
									Homecare News
									<span className="ml-1 font-normal text-slate-500 text-sm">
										by{" "}
										<a
											href="https://www.trollycare.com/"
											className="text-slate-500 no-underline hover:underline"
										>
											{COMPANY_NAME}
										</a>
									</span>
								</h1>
							</td>
							<td className="text-right align-middle">
								<a
									href={`${CLIENT_URL}/subscribe`}
									className="text-slate-500 text-sm no-underline hover:underline"
								>
									Subscribe
								</a>
								<a
									href="https://www.trollycare.com/"
									className="text-slate-500 text-sm no-underline hover:underline"
								>
									Contact Us
								</a>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<main>
				<div className="py-5">
					<div className="pb-5">
						<div className="mb-6 font-semibold text-slate-500 text-sm">
							{dates.start} to {dates.end}
						</div>
						<p className="pb-5 text-slate-500 text-sm italic">{props.summary}</p>
					</div>
					<div>
						{props.categories.map((category) => (
							<div key={category.name} className="pb-12">
								<h2 className="mb-4 text-xl">{category.name}</h2>
								{category.articles.map((article) => (
									<article
										key={article.id}
										className="border-slate-200 border-b py-6 last:border-b-0"
									>
										<h3 className="text-lg text-sky-600">
											<a
												className="text-sky-600 no-underline hover:underline"
												href={article.link}
											>
												{article.title}
											</a>
										</h3>
										<p className="pt-5 text-sm">{article.description}</p>
									</article>
								))}
							</div>
						))}
					</div>
				</div>
			</main>
			<footer className="text-center text-xs">
				<p className="pb-2.5 text-slate-500">
					<b>
						TrollyCare Insurance is a division of{" "}
						<a
							href="https://www.insurancebcx.com/"
							className="text-sky-600 no-underline hover:underline"
						>
							Insurance BCX
						</a>
					</b>
				</p>
				<p className="pb-2.5 text-slate-500">
					+1 (833)-419-3093 | Proudly based in El Paso, TX
				</p>
				<p className="pb-2.5 text-slate-500">
					© {dates.year} {COMPANY_NAME}. All rights reserved.
				</p>
				<p>
					{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
					To unsubscribe from this newsletter, <a href="#">click here</a>.</p>
			</footer>
		</div>
	);
}
