import type React from "react";
import { Badge } from "@/components/ui/badge";
import { useAutoAnimate } from '@formkit/auto-animate/react'

interface RecipientBadgesProps {
	recipientEmails: string[];
}

const RecipientsDisplay: React.FC<RecipientBadgesProps> = ({
	recipientEmails,
}) => {
	const [parent] = useAutoAnimate();

	return (
	<div className="flex items-center flex-wrap gap-1" ref={parent}>
		{recipientEmails.map((email) => (
			<Badge key={email} className="hover:bg-primary">
				{email}
			</Badge>
		))}
	</div>
	);
};

export default RecipientsDisplay;