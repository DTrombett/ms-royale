import type { ClientRoyale } from "..";
import type { APIClan } from "../APITypes";
import { Clan } from "../structures";
import { FetchableManager } from "./FetchableManager";

/**
 * A manager for clans.
 */
export class ClanManager extends FetchableManager<typeof Clan> {
	/**
	 * @param client The client to use.
	 * @param data The data to use.
	 */
	constructor(client: ClientRoyale, data?: APIClan[]) {
		super(client, Clan, data);
	}
}
