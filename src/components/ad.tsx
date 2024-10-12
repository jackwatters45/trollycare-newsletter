import type { Ad } from "@/types";
import { ExternalLink } from "lucide-react";
import type React from "react";

const AdComponent: React.FC<Ad> = (props) => {
	const adStyle: Record<Ad["type"], string> = {
		BANNER: "w-full h-24",
		INLINE: "w-full h-32",
	};

	return (
		<div className={`ad ${adStyle[props.type]} flex items-center justify-center`}>
			<a
				href={props.link}
				target="_blank"
				rel="noopener noreferrer"
				className="block h-full w-full"
			>
				<div className="absolute top-0 left-0 rounded-br bg-black bg-opacity-50 px-2 py-1 text-white text-xs">
					Sponsored by {props.company}
				</div>
				{props.imageUrl && (
					<img
						src={props.imageUrl}
						alt={props.title}
						className="h-full w-full object-cover"
					/>
				)}
				<div className="flex h-full flex-col items-center justify-center p-4 text-center">
					<h3 className="mb-2 font-semibold text-lg">{props.title}</h3>
					{props.description && <p className="mb-2 text-sm">{props.description}</p>}
					<span className="inline-flex items-center text-blue-500">
						Learn More <ExternalLink className="ml-1 h-4 w-4" />
					</span>
				</div>
			</a>
		</div>
	);
};

export default AdComponent;
