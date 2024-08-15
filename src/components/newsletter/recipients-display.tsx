import type React from "react";
import { Badge } from "@/components/ui/badge";

interface RecipientBadgesProps {
	recipientEmails: string[];
}

const RecipientsDisplay: React.FC<RecipientBadgesProps> = ({
	recipientEmails,
}) => (
	<div className="flex items-center flex-wrap gap-1">
		{recipientEmails.map((email) => (
			<Badge key={email} className="hover:bg-primary">
				{email}
			</Badge>
		))}
	</div>
);

export default RecipientsDisplay;
