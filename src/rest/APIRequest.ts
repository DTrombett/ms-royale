import type { IncomingMessage, OutgoingHttpHeaders } from "node:http";
import { Agent, get } from "node:https";
import { URL, URLSearchParams } from "node:url";
import type { Path, RequestOptions, Response } from "../types";
import { Constants, RequestStatus } from "../types";
import type Rest from "./Rest";

const agent = new Agent({ keepAlive: true });

/**
 * A class representing a request to the API
 */
export class APIRequest {
	/**
	 * The base url of this request
	 */
	baseUrl: string;

	/**
	 * Headers to be sent in the request
	 */
	headers: OutgoingHttpHeaders;

	/**
	 * The path of this request
	 */
	path: Path;

	/**
	 * Query applied to the request
	 */
	query: URLSearchParams;

	/**
	 * The rest manager that instantiated this
	 */
	rest: Rest;

	/**
	 * The status of this request
	 */
	status = RequestStatus.Pending;

	/**
	 * @param rest - The rest that instantiated this
	 * @param path - The path to request
	 * @param method - The method of the request
	 * @param options - Options for this request
	 */
	constructor(rest: Rest, path: Path, options: RequestOptions = {}) {
		const { url = Constants.APIUrl, query, headers } = options;

		this.path = path;
		this.rest = rest;

		this.baseUrl = url;
		this.query =
			query instanceof URLSearchParams ? query : new URLSearchParams(query);

		this.headers = {
			Accept: "application/json",
			Authorization: `Bearer ${rest.client.tokenRoyale}`,
			...headers,
		};
	}

	/**
	 * The full URL of this request
	 */
	get url() {
		const url = new URL(this.baseUrl);

		url.pathname += this.path;
		url.search = this.query.toString();
		return url;
	}

	/**
	 * Send the request to the api.
	 * @returns A promise with the data received from the API or null if there is no data
	 */
	send() {
		return new Promise<Response>((resolve, reject) => {
			this.status = RequestStatus.InProgress;
			this.make(resolve, reject);
		});
	}

	/**
	 * Edit headers for this request
	 * @param headers - Headers to add/remove
	 * @returns The new request
	 */
	editHeaders(headers: RequestOptions["headers"]) {
		this.headers = { ...this.headers, ...headers };
		return this;
	}

	/**
	 * Make the request to the API.
	 * @param resolve A function to resolve the promise
	 * @param reject A function to reject the promise
	 */
	private make(
		resolve: (value: PromiseLike<Response> | Response) => void,
		reject: (reason?: any) => void
	) {
		// This is the data we'll receive
		let data = "";

		const timeout = setTimeout(() => {
			// Abort the request if it takes more than Constants.AbortTimeout
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			req.destroy(
				new Error(
					`Request to path ${this.path} took more than ${
						Constants.AbortTimeout / 1_000
					} seconds and was aborted before ending.`
				)
			);
		}, Constants.AbortTimeout).unref();
		const callback = (res: IncomingMessage) => {
			if (
				[301, 302].includes(res.statusCode!) &&
				res.headers.location != null
			) {
				// Handle a possible redirect
				this.url.href = res.headers.location;
				this.url.search = this.query.toString();
				this.make(resolve, reject);
				return;
			}

			// Handle the data received
			res.on("data", (d) => {
				data += d;
			});
			res.once("end", () => {
				if (!res.complete)
					throw new Error(
						`Request to path ${this.path} ended before all data was transferred.`
					);
				clearTimeout(timeout);
				resolve({
					data: data || null,
					statusCode: res.statusCode!,
					headers: res.headers,
					status: res.statusMessage!,
					request: this,
				});
				this.status = RequestStatus.Finished;
			});
		};
		const req = get(
			this.url,
			{
				agent,
				headers: this.headers,
			},
			callback
		);

		req.once("error", (error) => {
			reject(
				new Error(
					`Request to ${this.url.href} failed with reason: ${error.message}`
				)
			);
			this.status = RequestStatus.Failed;
		});
		req.end();
	}
}

export default APIRequest;
