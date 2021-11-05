/* eslint-disable class-methods-use-this */
import type { Path, FetchOptions } from "../util";
import Constants from "../util";
import type { JsonObject } from "./Structure";
import { Structure } from "./Structure";

/**
 * A structure that can be fetched.
 */
export class FetchableStructure<
	T extends JsonObject = JsonObject
> extends Structure<T> {
	/**
	 * The route to fetch the structure from.
	 */
	static route: Path;

	/**
	 * The path to fetch the structure from.
	 */
	static path(id: string): Path {
		return this.route.replace(":id", id) as Path;
	}

	/**
	 * Fetches the structure from the API.
	 * @returns The new structure.
	 */
	fetch({
		force = false,
		maxAge = Constants.maxAge,
	}: FetchOptions = {}): Promise<this> {
		if (!force && Date.now() - this.updatedAt.getTime() < maxAge)
			return Promise.resolve(this);

		return this.client.rapi
			.get<T>((this.constructor as typeof FetchableStructure).path(this.id))
			.then(this.patch.bind(this));
	}
}
