import type { ClientRoyale } from "..";
import type { APILastSeen, APIMember, APITag } from "../APITypes";
import { ClanMemberRole, getEnumString } from "../util";
import type { Arena } from "./Arena";
import type { Clan } from "./Clan";
import { Structure } from "./Structure";

/**
 * A class representing a clan member.
 */
export class ClanMember extends Structure<APIMember> {
	/**
	 * The clan of the member.
	 */
	clan: Clan;

	/**
	 * The tag of the clan member.
	 */
	tag: APITag;

	/**
	 * The name of the clan member.
	 */
	name: string;

	/**
	 * The role of the clan member.
	 */
	role: ClanMemberRole;

	/**
	 * The last time the clan member was seen.
	 */
	lastSeen: Date;

	/**
	 * The exp level of the clan member.
	 */
	expLevel: number;

	/**
	 * The number of trophies the clan member has.
	 */
	trophies: number;

	/**
	 * The rank of the clan member.
	 */
	rank: number;

	/**
	 * The previous rank of the clan member.
	 */
	previousRank: number;

	/**
	 * The number of donations the clan member has made.
	 */
	donations: number;

	/**
	 * The number of donations the clan member has received.
	 */
	donationsReceived: number;

	/**
	 * The arena the clan member is currently in.
	 */
	arena: Arena;

	/**
	 * @param client The client instance.
	 * @param data The data of the clan member.
	 */
	constructor(client: ClientRoyale, data: APIMember, clan: Clan) {
		super(client, data);

		this.clan = clan;
		this.tag = data.tag;
		this.name = data.name;
		this.role = ClanMemberRole[data.role];
		this.lastSeen = new Date(0);
		this.lastSeen.setFullYear(
			Number(data.lastSeen.slice(0, 4)),
			Number(data.lastSeen.slice(4, 6)) - 1,
			Number(data.lastSeen.slice(6, 8))
		);
		this.lastSeen.setHours(
			Number(data.lastSeen.slice(9, 11)),
			Number(data.lastSeen.slice(11, 13)),
			Number(data.lastSeen.slice(14, 15))
		);
		this.expLevel = data.expLevel;
		this.trophies = data.trophies;
		this.arena = client.arenas.add(data.arena);
		this.rank = data.clanRank;
		this.previousRank = data.previousClanRank;
		this.donations = data.donations;
		this.donationsReceived = data.donationsReceived;
	}

	/**
	 * Patches the clan member.
	 * @param data The data to update.
	 * @returns The updated clan member.
	 */
	patch(data: Partial<APIMember>): this {
		super.patch(data);

		if (data.name !== undefined) this.name = data.name;
		if (data.role !== undefined) this.role = ClanMemberRole[data.role];
		if (data.clanRank !== undefined) this.rank = data.clanRank;
		if (data.previousClanRank !== undefined)
			this.previousRank = data.previousClanRank;
		if (data.donations !== undefined) this.donations = data.donations;
		if (data.donationsReceived !== undefined)
			this.donationsReceived = data.donationsReceived;
		if (data.expLevel !== undefined) this.expLevel = data.expLevel;
		if (data.lastSeen !== undefined) {
			this.lastSeen = new Date(0);
			this.lastSeen.setFullYear(
				Number(data.lastSeen.slice(0, 4)),
				Number(data.lastSeen.slice(4, 6)) - 1,
				Number(data.lastSeen.slice(6, 8))
			);
			this.lastSeen.setHours(
				Number(data.lastSeen.slice(9, 11)),
				Number(data.lastSeen.slice(11, 13)),
				Number(data.lastSeen.slice(14, 15))
			);
		}
		if (data.trophies !== undefined) this.trophies = data.trophies;
		if (data.arena !== undefined)
			this.arena = this.client.arenas.add(data.arena);

		return this;
	}

	/**
	 * Returns a JSON representation of the clan member.
	 */
	toJson(): APIMember {
		return {
			arena: this.arena.toJson(),
			clanChestPoints: 0,
			clanRank: this.rank,
			donations: this.donations,
			donationsReceived: this.donationsReceived,
			expLevel: this.expLevel,
			lastSeen: `${this.lastSeen.getFullYear()}${(this.lastSeen.getMonth() + 1)
				.toString()
				.padStart(2, "0")}${this.lastSeen
				.getDate()
				.toString()
				.padStart(2, "0")}T${this.lastSeen
				.getHours()
				.toString()
				.padStart(2, "0")}${this.lastSeen
				.getMinutes()
				.toString()
				.padStart(2, "0")}${this.lastSeen
				.getSeconds()
				.toString()
				.padStart(2, "0")}.000Z` as APILastSeen,
			name: this.name,
			previousClanRank: this.previousRank,
			role: getEnumString(ClanMemberRole, this.role),
			tag: this.tag,
			trophies: this.trophies,
		};
	}

	/**
	 * Returns a string representation of the clan member.
	 * @returns The name of the clan member.
	 */
	toString(): string {
		return this.name;
	}
}
