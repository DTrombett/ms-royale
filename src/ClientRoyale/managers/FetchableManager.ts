import type { ClientRoyale } from "..";
import type { FetchableStructure } from "../structures/FetchableStructure";
import type { StructureType } from "./Manager";
import { Manager } from "./Manager";

export type ConstructableFetchableStructure = Omit<
	typeof FetchableStructure,
	"constructor"
> & {
	prototype: FetchableStructure;
	new (client: ClientRoyale, data: any, ...args: any[]): FetchableStructure;
};

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
		force?: boolean
	): Promise<this["structure"]["prototype"]> {
		const data = this.get(id);
		if (data && force === true) return data;
		return this.add(
			await this.client.rapi.get<StructureType<T>>(this.structure.path(id))
		);
	}
}
