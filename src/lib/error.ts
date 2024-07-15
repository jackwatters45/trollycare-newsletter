export class APIError extends Error {
	statusCode: number;
	statusText: string;
	data: unknown;

	constructor(
		message: string,
		statusCode: number,
		statusText: string,
		data?: unknown,
	) {
		super(message);
		this.name = "APIError";
		this.statusCode = statusCode;
		this.statusText = statusText;
		this.data = data;

		// This line is necessary for proper prototype chain setup in TypeScript
		Object.setPrototypeOf(this, APIError.prototype);
	}

	static fromResponse(response: Response, data?: unknown): APIError {
		return new APIError(
			"API request failed",
			response.status,
			response.statusText,
			data,
		);
	}
}
