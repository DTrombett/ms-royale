import type { ConstructableFetchableStructure, FetchOptions } from "../util";
import { Constants } from "../util";
import type { StructureType } from "./Manager";
import { Manager } from "./Manager";

/**
 * A manager that can fetch structures.
 */
export class FetchableManager<
	T extends ConstructableFetchableStructure = ConstructableFetchableStructure
> extends Manager<T> {
	/**
	 * Fetches a structure from this manager.
	 * @param id The ID of the structure to fetch.
	 * @param force Whether to skip the cache and fetch from the API.
	 */
	async fetch(
		id: string,
		{ force = false, maxAge = Constants.maxAge }: FetchOptions = {}
	): Promise<this["structure"]["prototype"]> {
		const data = this.get(id);

		if (data && !force && Date.now() - data.updatedAt.getTime() < maxAge)
			return data;
		return this.add(
			await this.client.rapi.get<StructureType<T>>(this.structure.path(id))
		);
	}
}
