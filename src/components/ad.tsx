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
				className="block w-full h-full"
			>
				<div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-br">
					Sponsored by {props.company}
				</div>
				{props.imageUrl && (
					<img
						src={props.imageUrl}
						alt={props.title}
						className="w-full h-full object-cover"
					/>
				)}
				<div className="flex flex-col justify-center items-center h-full p-4 text-center">
					<h3 className="text-lg font-semibold mb-2">{props.title}</h3>
					{props.description && <p className="text-sm mb-2">{props.description}</p>}
					<span className="inline-flex items-center text-blue-500">
						Learn More <ExternalLink className="ml-1 h-4 w-4" />
					</span>
				</div>
			</a>
		</div>
	);
};

export default AdComponent;
