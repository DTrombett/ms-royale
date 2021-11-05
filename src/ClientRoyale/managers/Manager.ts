import { Collection } from "@discordjs/collection";
import type { ClientRoyale } from "..";
import type { Structure } from "../structures";

export type ConstructableStructure = Omit<typeof Structure, "constructor"> & {
	prototype: Structure;
	new (client: ClientRoyale, data: any, ...args: any[]): Structure;
};

export type StructureType<T extends ConstructableStructure> = T extends new (
	client: ClientRoyale,
	data: infer R,
	...args: any[]
) => Structure
	? R
	: never;

/**
 * A manager to handle structures' data.
 */
export class Manager<
	T extends ConstructableStructure = ConstructableStructure
> extends Collection<string, T["prototype"]> {
	/**
	 * The client this manager is for.
	 */
	client: ClientRoyale;

	/**
	 * The structure class this manager handles.
	 */
	structure: T;

	/**
	 * @param client The client this manager is for.
	 */
	constructor(client: ClientRoyale, structure: T, data?: StructureType<T>[]) {
		super(
			data?.map((APIInstance) => {
				const instance = new structure(client, APIInstance);

				return [instance.id, instance];
			})
		);

		this.client = client;
		this.structure = structure;
	}

	/**
	 * Adds a structure to this manager.
	 * @param structure The structure to add.
	 */
	add(structure: StructureType<T>): this["structure"]["prototype"] {
		const existing = this.get(structure[this.structure.id] as string);
		if (existing != null) return existing.patch(structure);
		const instance = new this.structure(this.client, structure);
		this.set(instance.id, instance);
		return instance;
	}

	/**
	 * Removes a structure from this manager.
	 * @param id The id of the structure to remove.
	 */
	remove(id: string): boolean {
		return this.delete(id);
	}
}
