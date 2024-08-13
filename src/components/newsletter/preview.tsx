import { COMPANY_NAME } from "@/lib/constants";
import { getPastWeekDate } from "@/lib/utils";
import type { Category } from "@/types";

export function NewsletterPreview(props: {
	sendDate: string;
	summary: string;
	categories: Category[];
}) {
	const dates = getPastWeekDate(props.sendDate);

	return (
		<div className="bg-white text-slate-900 font-sans max-w-[600px] mx-auto p-5 leading-relaxed">
			<div className="border-b-2 border-slate-200 pb-3">
				<table className="w-full">
					<tbody>
						<tr>
							<td className="text-left align-middle">
								<h1 className="text-lg font-bold text-black">
									Homecare News
									<span className="font-normal text-sm text-slate-500 ml-1">
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
									href="https://www.trollycare.com/"
									className="text-sm text-slate-500 no-underline hover:underline"
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
						<div className="text-slate-500 font-semibold mb-6 text-sm">
							{dates.start} to {dates.end}
						</div>
						<p className="italic text-sm pb-5 text-slate-500">{props.summary}</p>
					</div>
					<div>
						{props.categories.map((category) => (
							<div key={category.name} className="pb-12">
								<h2 className="text-xl mb-4">{category.name}</h2>
								{category.articles.map((article) => (
									<article
										key={article.id}
										className="py-6 border-b border-slate-200 last:border-b-0"
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
			<footer className="text-xs text-center">
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
			</footer>
		</div>
	);
}
