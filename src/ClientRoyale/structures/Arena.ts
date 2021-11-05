import type { ClientRoyale } from "..";
import type { APIArena } from "../APITypes";
import { Structure } from "./Structure";

/**
 * A class representing an arena.
 */
export class Arena extends Structure<APIArena> {
	static id = "id";

	/**
	 * The name of the arena.
	 */
	name: string;

	/**
	 * @param client The client that instantiated this arena.
	 * @param data The data of the arena.
	 */
	constructor(client: ClientRoyale, data: APIArena) {
		super(client, data);

		this.name = data.name;
	}

	/**
	 * Gets a JSON representation of this arena.
	 * @returns The JSON representation of this arena.
	 */
	toJson(): APIArena {
		return {
			name: this.name,
			id: Number(this.id),
		};
	}

	/**
	 * Gets a string representation of this arena.
	 * @returns The name of the arena.
	 */
	toString(): string {
		return this.name;
	}

	/**
	 * Patches this arena.
	 * @param data The data to update this arena with.
	 */
	patch(data: APIArena): this {
		super.patch(data);

		this.name = data.name;
		return this;
	}
}
