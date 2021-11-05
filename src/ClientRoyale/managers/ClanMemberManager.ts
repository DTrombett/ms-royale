import type { ClientRoyale } from "..";
import type { APIMember } from "../APITypes";
import type { Clan } from "../structures";
import { ClanMember } from "../structures";
import type { FetchOptions } from "../util";
import Constants from "../util";
import { Manager } from "./Manager";

/**
 * A manager for clan members.
 */
export class ClanMemberManager extends Manager<typeof ClanMember> {
	/**
	 * The clan this manager is for.
	 */
	clan: Clan;

	/**
	 * @param client The client this manager is for.
	 * @param clan The clan this manager is for.
	 * @param data The data to create the clan members from.
	 */
	constructor(client: ClientRoyale, clan: Clan, data?: APIMember[]) {
		super(client, ClanMember, data);

		this.clan = clan;
	}

	/**
	 * Fetches the clan members.
	 * @param options The options for the fetch.
	 */
	async fetch({
		force = false,
		maxAge = Constants.maxAge,
	}: FetchOptions = {}): Promise<this> {
		if (!force && Date.now() - this.clan.updatedAt.getTime() < maxAge)
			return Promise.resolve(this);
		return this.client.rapi
			.get<APIMember[]>(`/clans/${this.clan.tag}/members`)
			.then((memberList) => this.clan.patch({ memberList }))
			.then(() => this);
	}
}
