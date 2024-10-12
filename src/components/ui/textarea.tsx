"use client";

import RCTextarea from "rc-textarea";
import type { TextAreaProps, TextAreaRef } from "rc-textarea";
import * as React from "react";

import { cn } from "@/lib/utils";

// Explicitly define the component type
type TextareaComponent = React.ForwardRefExoticComponent<
	TextAreaProps & React.RefAttributes<TextAreaRef>
>;

const Textarea: TextareaComponent = React.forwardRef<
	TextAreaRef,
	TextAreaProps
>(({ className, ...props }, ref) => {
	return (
		<RCTextarea
			className={cn(
				"flex w-full rounded-md border-input bg-background px-3 py-2 text-sm italic ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:not-italic",
				className,
			)}
			ref={ref}
			autoSize={true}
			{...props}
		/>
	);
});

Textarea.displayName = "Textarea";

export { Textarea };
