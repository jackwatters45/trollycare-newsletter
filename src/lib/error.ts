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

		Object.setPrototypeOf(this, APIError.prototype);
	}

	static fromResponse(response: Response, data?: unknown): APIError {
		const message =
			typeof data === "object" && data !== null && "message" in data
				? String(data.message)
				: "API request failed";

		return new APIError(message, response.status, response.statusText, data);
	}
}
