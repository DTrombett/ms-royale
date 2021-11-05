import type { ClientRoyale } from "..";
import type { APIArena } from "../APITypes";
import { Arena } from "../structures";
import { Manager } from "./Manager";

/**
 * A manager for arenas.
 */
export class ArenaManager extends Manager<typeof Arena> {
	constructor(client: ClientRoyale, data?: APIArena[]) {
		super(client, Arena, data);
	}
}
