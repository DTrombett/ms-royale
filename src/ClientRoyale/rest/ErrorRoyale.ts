import type { OutgoingHttpHeaders } from "http";
import type { Path, Response } from "../../types";
import type APIRequest from "./APIRequest";

/**
 * A class representing a GitHub error
 */
export class ErrorRoyale extends Error {
	/**
	 * Other details about this error provided by the API
	 */
	details?: Record<string, unknown>;

	/**
	 * Headers sent in the request
	 */
	headers: OutgoingHttpHeaders;

	/**
	 * Path of the request
	 */
	path: Path;

	/**
	 * The query of the request
	 */
	query?: string;

	/**
	 * The status message received from the API
	 */
	status: string;

	/**
	 * The status code received for this request
	 */
	statusCode: number;

	/**
	 * @param request - The request sent
	 * @param res - The response received
	 */
	constructor(request: APIRequest, res: Response) {
		let error: string | undefined;
		const query = request.query.toString();

		if (res.data != null) {
			// Parse any JSON error data
			const errorData = JSON.parse(res.data) as {
				reason: string;
				message?: string;
				type?: string;
				detail?: Record<string, unknown>;
			};

			error = errorData.message;
		}
		if (error == null) error = res.status;
		super(error);

		if (query) this.query = query;

		this.headers = request.headers;
		this.path = request.path;
		this.status = res.status;
		this.statusCode = res.statusCode;
	}
}

export default ErrorRoyale;
