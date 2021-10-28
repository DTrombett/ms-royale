import { AsyncQueue } from "@sapphire/async-queue";
import type { ClientRoyale } from "../Client";
import type { Json, Path, RequestOptions } from "../types";
import APIRequest from "./APIRequest";
import ErrorRoyale from "./ErrorRoyale";

/**
 * A rest manager for the client
 */
export class Rest {
	/**
	 * The client that instantiated this
	 */
	client: ClientRoyale;

	/**
	 * A queue for the requests
	 */
	queue = new AsyncQueue();

	/**
	 * All requests that have been made so far
	 */
	requests: APIRequest[] = [];

	/**
	 * @param client - The client that instantiated this
	 */
	constructor(client: ClientRoyale) {
		this.client = client;
	}

	/**
	 * Make a request to the API.
	 * @param path - The path to request
	 * @param options - Other options for this request
	 * @param retry - If the request should be retried in case of a 5xx response
	 * @template T The return type that should be used by the function
	 * @returns The JSON data received from the API or null if no data was received
	 */
	async request<T extends Json | null = Json | null>(
		path: Path,
		options?: RequestOptions,
		retry = true
	): Promise<T | null> {
		await this.queue.wait();

		// The `as post` is just to suppress the error
		const request = new APIRequest(this, path, options);

		this.requests.push(request);

		let data;
		const res = await request.send();

		if (res.statusCode === 429)
			// If we encountered a ratelimit... well, this is a problem!
			// DON'T shift the queue so that other requests cannot be made as they may result in an other ratelimit
			// this.queue.shift();
			throw new ErrorRoyale(request, res);
		if (res.statusCode >= 200 && res.statusCode < 300)
			// If the request is ok parse the data received
			data = JSON.parse(res.data!) as T;
		else if (res.statusCode >= 300 && res.statusCode < 400)
			// In this case we have no data
			data = null;
		else if (res.statusCode >= 500 && retry) {
			// If there's a server error retry just one time
			this.queue.shift();
			return this.request(path, options, false);
		}

		this.queue.shift();
		if (data !== undefined) return data;

		// If we didn't receive a succesful response, throw an error
		throw new ErrorRoyale(request, res);
	}
}

export default Rest;
