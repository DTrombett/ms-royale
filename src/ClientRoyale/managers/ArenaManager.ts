import type { ClientRoyale } from "..";
import type { APIArena } from "../APITypes";
import { Arena } from "../structures";
import type { StringId } from "../util";
import { Manager } from "./Manager";

/**
 * A manager for arenas
 */
export class ArenaManager extends Manager<typeof Arena> {
	/**
	 * @param client - The client that instantiated this manager
	 * @param data - The data to initialize the manager with
	 */
	constructor(client: ClientRoyale, data?: APIArena[]) {
		super(client, Arena, data);
	}

	/**
	 * Adds an arena to this manager.
	 * @param data - The data of the arena to add
	 * @returns The added arena
	 */
	add(data: APIArena): Arena {
		return super.add(data);
	}

	/**
	 * Removes an arena from the manager.
	 * @param id - The id of the arena to remove
	 * @returns The removed arena, if it exists
	 */
	remove(id: StringId): Arena | undefined {
		return super.remove(id);
	}
}
